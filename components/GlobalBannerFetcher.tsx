import { getCurrentUser } from "@/lib/actions/auth.action";
import { getActiveAnnouncements } from "@/lib/actions/broadcast.action";
import GlobalBanner from "./GlobalBanner";

export default async function GlobalBannerFetcher() {
  try {
    const user = await getCurrentUser();
    
    if (!user) return null;

    const targetType = user.type === "student" || user.type === "college" ? "colleges" : "users";
    const res = await getActiveAnnouncements(targetType, user.id);
    
    if (res.success && res.announcements && res.announcements.length > 0) {
      return <GlobalBanner announcements={res.announcements} />;
    }
  } catch (error) {
    // Silently fail if auth or network errors out for banner
    console.error("Failed to fetch global banner:", error);
  }

  return null;
}
