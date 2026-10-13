"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

/* Shows "Saved." or "Deleted." when a page is reached with ?saved=1 or ?saved=deleted,
   then clears the flag from the URL. */
export default function Toast() {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const saved = params.get("saved");
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!saved) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- syncing UI to a URL flag
    setVisible(true);
    const t = setTimeout(() => {
      setVisible(false);
      router.replace(pathname, { scroll: false });
    }, 3000);
    return () => clearTimeout(t);
  }, [saved, pathname, router]);

  if (!visible) return null;
  return (
    <div
      role="status"
      className="fixed bottom-6 right-6 z-50 rounded-xl border border-line bg-steel px-5 py-3 text-sm text-bone shadow-lg"
    >
      {saved === "deleted" ? "Deleted." : "Saved."}
    </div>
  );
}
