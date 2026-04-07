/**
 * pages.config.js - Page routing configuration
 * 
 * This file is AUTO-GENERATED. Do not add imports or modify PAGES manually.
 * Pages are auto-registered when you create files in the ./pages/ folder.
 * 
 * THE ONLY EDITABLE VALUE: mainPage
 * This controls which page is the landing page (shown when users visit the app).
 * 
 * Example file structure:
 * 
 *   import HomePage from './pages/HomePage';
 *   import Dashboard from './pages/Dashboard';
 *   import Settings from './pages/Settings';
 *   
 *   export const PAGES = {
 *       "HomePage": HomePage,
 *       "Dashboard": Dashboard,
 *       "Settings": Settings,
 *   }
 *   
 *   export const pagesConfig = {
 *       mainPage: "HomePage",
 *       Pages: PAGES,
 *   };
 * 
 * Example with Layout (wraps all pages):
 *
 *   import Home from './pages/Home';
 *   import Settings from './pages/Settings';
 *   import __Layout from './Layout.jsx';
 *
 *   export const PAGES = {
 *       "Home": Home,
 *       "Settings": Settings,
 *   }
 *
 *   export const pagesConfig = {
 *       mainPage: "Home",
 *       Pages: PAGES,
 *       Layout: __Layout,
 *   };
 *
 * To change the main page from HomePage to Dashboard, use find_replace:
 *   Old: mainPage: "HomePage",
 *   New: mainPage: "Dashboard",
 *
 * The mainPage value must match a key in the PAGES object exactly.
 */
import AdCopyList from './pages/AdCopyList';
import AudiobookCreator from './pages/AudiobookCreator';
import AudiobookList from './pages/AudiobookList';
import BrandStudio from './pages/BrandStudio';
import BrandStudioEdit from './pages/BrandStudioEdit';
import BrandStudioList from './pages/BrandStudioList';
import Agency from './pages/Agency';
import AudioMixer from './pages/AudioMixer';
import Billing from './pages/Billing';
import CloneList from './pages/CloneList';
import ConversationalList from './pages/ConversationalList';
import CreateConversational from './pages/CreateConversational';
import CloneVoice from './pages/CloneVoice';
import CreateAdCopy from './pages/CreateAdCopy';
import CreateCustomVoice from './pages/CreateCustomVoice';
import CreateVSL from './pages/CreateVSL';
import CreateVoiceover from './pages/CreateVoiceover';
import CustomVoiceList from './pages/CustomVoiceList';
import DFYOffers from './pages/DFYOffers';
import GettingStarted from './pages/GettingStarted';
import Dashboard from './pages/Dashboard';
import MixerList from './pages/MixerList';
import SignIn from './pages/SignIn';
import Support from './pages/Support';
import Transcribe from './pages/Transcribe';
import VSLList from './pages/VSLList';
import VideoTutorials from './pages/VideoTutorials';
import ViralPro from './pages/ViralPro';
import VoiceAdmin from './pages/VoiceAdmin';
import VoiceoverList from './pages/VoiceoverList';
import __Layout from './Layout.jsx';


export const PAGES = {
    "AdCopyList": AdCopyList,
    "AudiobookCreator": AudiobookCreator,
    "AudiobookList": AudiobookList,
    "Agency": Agency,
    "AudioMixer": AudioMixer,
    "Billing": Billing,
    "CloneList": CloneList,
    "ConversationalList": ConversationalList,
    "CreateConversational": CreateConversational,
    "CloneVoice": CloneVoice,
    "CreateAdCopy": CreateAdCopy,
    "CreateCustomVoice": CreateCustomVoice,
    "CreateVSL": CreateVSL,
    "CreateVoiceover": CreateVoiceover,
    "CustomVoiceList": CustomVoiceList,
    "BrandStudio": BrandStudio,
    "BrandStudioEdit": BrandStudioEdit,
    "BrandStudioList": BrandStudioList,
    "DFYOffers": DFYOffers,
    "GettingStarted": GettingStarted,
    "Dashboard": Dashboard,
    "MixerList": MixerList,
    "SignIn": SignIn,
    "Support": Support,
    "Transcribe": Transcribe,
    "VSLList": VSLList,
    "VideoTutorials": VideoTutorials,
    "ViralPro": ViralPro,
    "VoiceAdmin": VoiceAdmin,
    "VoiceoverList": VoiceoverList,
}

export const pagesConfig = {
    mainPage: "Dashboard",
    Pages: PAGES,
    Layout: __Layout,
};