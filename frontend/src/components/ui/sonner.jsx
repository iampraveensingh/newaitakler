import { Toaster as Sonner } from "sonner"

const Toaster = ({ ...props }) => {
  return (
    <Sonner
      theme="dark"
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-zinc-900 group-[.toaster]:text-white group-[.toaster]:border-zinc-700 group-[.toaster]:shadow-lg",
          description: "group-[.toast]:text-zinc-400",
          actionButton:
            "group-[.toast]:bg-white group-[.toast]:text-black group-[.toast]:font-semibold",
          cancelButton:
            "group-[.toast]:bg-zinc-800 group-[.toast]:text-zinc-300",
        },
      }}
      {...props}
    />
  );
}

export { Toaster }
