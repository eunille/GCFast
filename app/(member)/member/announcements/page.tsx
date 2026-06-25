// app/(member)/member/announcements/page.tsx
// Layer 4 — PRESENTATIONAL: Member announcements page (static/placeholder)

"use client";

import { useState } from "react";
import { Megaphone, Calendar, Pin, ChevronRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

// Mock data for announcements
const announcements = [
  {
    id: 1,
    title: "NEW GCFAS OFFICERS FOR ACADEMIC YEAR 2025-2026",
    date: "June 15, 2025",
    category: "GCFAS",
    isPinned: true,
    excerpt: "The Gordon College Faculty Association Staff is pleased to announce the newly elected officers for Academic Year 2025-2026...",
    content: `Gordon College Faculty Association Staff Officers AY 2025-2026

We are pleased to announce the newly elected officers who will serve the GCFAS community:

• President: Dr. Maria Santos (College of Engineering)
• Vice President: Prof. Juan Dela Cruz (College of Business)
• Secretary: Dr. Ana Reyes (College of Arts and Sciences)
• Treasurer: Prof. Roberto Garcia (College of Education)
• Business Manager: Dr. Carmen Villanueva (College of Nursing)
• Auditor: Prof. Luis Mendoza (College of Criminal Justice)

These officers were elected during the General Assembly held on June 10, 2025. They will serve until the end of the academic year.

For any inquiries or concerns, please feel free to reach out to any of the officers or visit the GCFAS office at Faculty Center, 2nd Floor.

Contact: gcfas@gordon.edu.ph | 047-222-4080`,
  },
  {
    id: 2,
    title: "NO ELEVATOR DAY EVERY FRIDAY",
    date: "September 12, 2025",
    category: "Policy",
    isPinned: true,
    excerpt: "To promote wellness, reduce congestion, and support building operations, the college will observe a no-elevator-use policy every Friday...",
    content: `Gordon College Friday No Elevator Use Policy

To promote wellness, reduce congestion, and support building operations, the college will observe a no-elevator-use policy every Friday, effective this month of September 2025.

• What: Elevators will be unavailable for routine use every Friday between 7:00am and 7:00pm.
• Why: The policy encourages physical activity, improves hallway traffic flow during busy times, and contributes to energy conservation and routine equipment checks.

Exceptions: Elevators remain available for:
- Individuals with disabilities or medical conditions
- Pregnant individuals and anyone with temporary mobility limitations
- Staff transporting heavy or bulky equipment
- Emergency situations

For questions or concerns, please contact: vp.adminfinance@gordoncollege.edu.ph or 047-222-4080 local 324.`,
  },
  {
    id: 2,
    title: "HELP US KEEP OUR CAMPUS IN TOP SHAPE!",
    date: "March 11, 2026",
    category: "Campus Life",
    isPinned: false,
    excerpt: "Join us in maintaining a clean and beautiful campus environment. Your participation matters!",
    content: "Join us in maintaining a clean and beautiful campus environment. Proper waste disposal, keeping common areas tidy, and reporting maintenance issues help create a better learning space for everyone. Your participation matters!",
  },
  {
    id: 3,
    title: "Implementation of Campus-Wide Energy Conservation Measures",
    date: "March 09, 2026",
    category: "Policy",
    isPinned: false,
    excerpt: "Gordon College is implementing energy conservation measures to promote sustainability and reduce operational costs...",
    content: "Gordon College is implementing energy conservation measures to promote sustainability and reduce operational costs. All faculty and staff are encouraged to turn off lights and air conditioning units when not in use, and to use natural lighting when possible.",
  },
  {
    id: 4,
    title: "REMINDERS TO ALL: ENERGY AND RESOURCES CONSERVATION",
    date: "March 04, 2026",
    category: "Reminder",
    isPinned: false,
    excerpt: "Please be mindful of energy and resource consumption. Turn off lights, computers, and air conditioning when leaving rooms...",
    content: "Please be mindful of energy and resource consumption. Turn off lights, computers, and air conditioning when leaving rooms. Use water wisely and report any leaks immediately. Together, we can make a difference!",
  },
  {
    id: 5,
    title: "UPDATED ACADEMIC CALENDAR FOR AY 2025-2026",
    date: "January 20, 2026",
    category: "Academic",
    isPinned: true,
    excerpt: "Please take note of the updated academic calendar for the current academic year 2025-2026...",
    content: "Please take note of the updated academic calendar for the current academic year 2025-2026. Key dates include midterm exams, final exams, and semester breaks. Check your email for the complete calendar.",
  },
  {
    id: 6,
    title: "ONSITE AND ONLINE CLASS SCHEDULE FOR 2ND SEMESTER AY 2025-2026",
    date: "January 20, 2026",
    category: "Academic",
    isPinned: false,
    excerpt: "The class schedule for the second semester is now available. Please check your student portal for your assigned schedule...",
    content: "The class schedule for the second semester is now available. Please check your student portal for your assigned schedule and room assignments. For any conflicts or concerns, contact the Registrar's Office.",
  },
  {
    id: 7,
    title: "REMINDERS: CLAYGO / BYOT POLICY being implemented in Gordon College",
    date: "August 22, 2025",
    category: "Policy",
    isPinned: false,
    excerpt: "Clean As You Go (CLAYGO) and Bring Your Own Tumbler (BYOT) policies are now strictly implemented across campus...",
    content: "Clean As You Go (CLAYGO) and Bring Your Own Tumbler (BYOT) policies are now strictly implemented across campus. Please clean up after yourself in all common areas and bring reusable tumblers to reduce plastic waste.",
  },
  {
    id: 8,
    title: "GORDON COLLEGE ACADEMIC CALENDAR AY 2025-2026",
    date: "August 04, 2025",
    category: "Academic",
    isPinned: false,
    excerpt: "The official academic calendar for AY 2025-2026 has been released. Please mark important dates on your calendar...",
    content: "The official academic calendar for AY 2025-2026 has been released. Important dates include enrollment periods, start of classes, exam schedules, and holidays. Download the full calendar from the college website.",
  },
];

const categories = ["All", "GCFAS", "Policy", "Academic", "Campus Life", "Reminder"];

export default function MemberAnnouncementsPage() {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const filteredAnnouncements = announcements.filter(
    (announcement) =>
      selectedCategory === "All" || announcement.category === selectedCategory
  );

  const pinnedAnnouncements = filteredAnnouncements.filter((a) => a.isPinned);
  const regularAnnouncements = filteredAnnouncements.filter((a) => !a.isPinned);

  return (
    <div className="flex flex-col gap-6 max-w-5xl mx-auto">
      
      {/* ── Page header ──────────────────────────────────────────────────── */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Announcements
        </h1>
        <p className="text-sm mt-1 text-muted-foreground">
          Stay updated with the latest news and announcements from Gordon College
        </p>
      </div>

      {/* ── Category filters ─────────────────────────────────────────────── */}
      <div className="flex flex-wrap gap-2">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              selectedCategory === category
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      {/* ── Pinned announcements ─────────────────────────────────────────── */}
      {pinnedAnnouncements.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Pin className="h-4 w-4 text-amber-500" />
            <h2 className="text-sm font-semibold text-foreground">Pinned Announcements</h2>
          </div>
          {pinnedAnnouncements.map((announcement) => (
            <AnnouncementCard
              key={announcement.id}
              announcement={announcement}
              isExpanded={expandedId === announcement.id}
              onToggle={() => setExpandedId(expandedId === announcement.id ? null : announcement.id)}
            />
          ))}
        </div>
      )}

      {/* ── Regular announcements ────────────────────────────────────────── */}
      <div className="space-y-3">
        {pinnedAnnouncements.length > 0 && (
          <h2 className="text-sm font-semibold text-foreground">Recent Announcements</h2>
        )}
        {regularAnnouncements.map((announcement) => (
          <AnnouncementCard
            key={announcement.id}
            announcement={announcement}
            isExpanded={expandedId === announcement.id}
            onToggle={() => setExpandedId(expandedId === announcement.id ? null : announcement.id)}
          />
        ))}
      </div>

      {/* ── Empty state ──────────────────────────────────────────────────── */}
      {filteredAnnouncements.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <Megaphone className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
            <p className="text-sm font-medium text-muted-foreground">
              No announcements found in this category
            </p>
          </CardContent>
        </Card>
      )}

    </div>
  );
}

// ── Announcement Card Component ─────────────────────────────────────────────

interface AnnouncementCardProps {
  announcement: typeof announcements[0];
  isExpanded: boolean;
  onToggle: () => void;
}

function AnnouncementCard({ announcement, isExpanded, onToggle }: AnnouncementCardProps) {
  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="secondary" className="text-xs">
                {announcement.category}
              </Badge>
              {announcement.isPinned && (
                <Pin className="h-3 w-3 text-amber-500 fill-amber-500" />
              )}
            </div>
            <CardTitle className="text-base font-semibold text-foreground leading-tight">
              {announcement.title}
            </CardTitle>
            <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
              <Calendar className="h-3 w-3" />
              <span>{announcement.date}</span>
            </div>
          </div>
          <button
            onClick={onToggle}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md hover:bg-muted transition-colors"
            aria-label={isExpanded ? "Collapse" : "Expand"}
          >
            <ChevronRight 
              className={`h-4 w-4 transition-transform ${isExpanded ? "rotate-90" : ""}`}
            />
          </button>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        {isExpanded ? (
          <div className="text-sm text-foreground whitespace-pre-line leading-relaxed">
            {announcement.content}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {announcement.excerpt}
          </p>
        )}
      </CardContent>
    </Card>
  );
}