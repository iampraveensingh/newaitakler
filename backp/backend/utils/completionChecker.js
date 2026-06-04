/**
 * Completion Notification Checker
 *
 * Polls the database every minute for records that have reached a terminal status
 * (completed / ready / done) but have NOT yet had a completion notification sent.
 *
 * This is the authoritative notification trigger — it fires regardless of whether
 * the status was set via the HTTP API, a cron job, a webhook, or a direct DB update.
 *
 * "Already notified" check: we do a LEFT JOIN against the notifications table
 * looking for a notification with matching entity_id, entity_type, AND the exact
 * completion title. If none exists, we fire.
 */

import { db }              from '../config/database.js';
import { pushNotification } from '../controllers/notificationController.js';

const COMPLETION_STATUSES = ['completed', 'ready', 'done'];

// Each entry: { table, nameField, completionTitle, icon, type }
const WATCHED_TABLES = [
  {
    table:            'voiceovers',
    nameField:        'title',
    completionTitle:  'Voiceover Ready',
    icon:             'done',
    type:             'voiceover',
    makeMessage:      (r) => `"${r._name || 'Untitled'}" is ready to play!`,
  },
  {
    table:            'voice_clones',
    nameField:        'name',
    completionTitle:  'Voice Clone Ready',
    icon:             'done',
    type:             'clone',
    makeMessage:      (r) => `"${r._name || 'Untitled'}" has been cloned and is ready to use.`,
  },
  {
    table:            'custom_voices',
    nameField:        'name',
    completionTitle:  'Custom Voice Ready',
    icon:             'done',
    type:             'custom_voice',
    makeMessage:      (r) => `"${r._name || 'Untitled'}" is ready to use.`,
  },
  {
    table:            'audio_mixes',
    nameField:        'name',
    completionTitle:  'Audio Mix Ready',
    icon:             'done',
    type:             'audio_mix',
    makeMessage:      (r) => `"${r._name || 'Untitled'}" has been mixed and is ready to download.`,
  },
  {
    table:            'transcriptions',
    nameField:        'title',
    completionTitle:  'Transcription Complete',
    icon:             'done',
    type:             'transcription',
    makeMessage:      (r) => `"${r._name || 'Untitled'}" has been transcribed successfully.`,
  },
  {
    table:            'conversational_voices',
    nameField:        'title',
    completionTitle:  'Conversation Ready',
    icon:             'done',
    type:             'conversational',
    makeMessage:      (r) => `"${r._name || 'Untitled'}" is ready to play!`,
  },
];

/**
 * Check one table and fire notifications for any newly completed rows.
 */
async function checkTable({ table, nameField, completionTitle, icon, type, makeMessage }) {
  const statusPlaceholders = COMPLETION_STATUSES.map(() => '?').join(', ');

  // Find rows that are completed but have no matching completion notification yet
  const [rows] = await db.query(
    `SELECT t.id, t.user_id, t.\`${nameField}\` AS _name
     FROM \`${table}\` t
     LEFT JOIN notifications n
       ON n.entity_id   = t.id
      AND n.entity_type = ?
      AND n.title       = ?
     WHERE t.status IN (${statusPlaceholders})
       AND n.id IS NULL
     LIMIT 20`,
    [table, completionTitle, ...COMPLETION_STATUSES]
  );

  for (const row of rows) {
    await pushNotification(row.user_id, {
      type,
      title:      completionTitle,
      message:    makeMessage(row),
      icon,
      entityId:   row.id,
      entityType: table,
    });
  }

  if (rows.length > 0) {
    console.log(`[CompletionChecker] Sent ${rows.length} "${completionTitle}" notification(s).`);
  }
}

// Prevents overlapping runs if a check takes longer than 1 minute
let isRunning = false;

/**
 * Run the full check across all watched tables.
 * Called by the cron scheduler every minute.
 * The in-memory lock guarantees only one run executes at a time —
 * safe because Node.js is single-threaded (the flag is set synchronously
 * before any await yields control).
 */
export async function runCompletionCheck() {
  if (isRunning) return;
  isRunning = true;
  try {
    for (const cfg of WATCHED_TABLES) {
      try {
        await checkTable(cfg);
      } catch (err) {
        console.warn(`[CompletionChecker] Error checking ${cfg.table}:`, err.message);
      }
    }
  } finally {
    isRunning = false;
  }
}
