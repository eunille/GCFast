// app/(member)/member/bylaws/page.tsx
// Layer 4 — PRESENTATIONAL: Member bylaws page (static/placeholder)

"use client";

import { useState } from "react";
import { BookOpen, Search, X, ChevronLeft } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

// Mock data for bylaws sections
const bylawsSections = [
  {
    id: 1,
    article: "Article I",
    title: "Name and Purpose",
    content: `Section 1: Name
The name of this organization shall be the Gordon College Faculty Association Staff (GCFAS).

Section 2: Purpose
The purpose of GCFAS shall be:
a) To promote the professional growth and welfare of all faculty members
b) To foster collegial relationships among faculty
c) To represent faculty interests in institutional governance
d) To support academic excellence and institutional development
e) To facilitate communication between faculty and administration`,
  },
  {
    id: 2,
    article: "Article II",
    title: "Membership",
    content: `Section 1: Eligibility
Membership in GCFAS is open to all full-time and part-time faculty members of Gordon College.

Section 2: Rights and Privileges
All members in good standing shall have the right to:
a) Vote in all association elections and matters
b) Hold office in the association
c) Participate in all association activities
d) Receive benefits and services provided by the association

Section 3: Dues
Annual membership dues shall be determined by the General Assembly and shall be payable at the beginning of each academic year.`,
  },
  {
    id: 3,
    article: "Article III",
    title: "Officers and Duties",
    content: `Section 1: Officers
The officers of GCFAS shall consist of:
a) President
b) Vice President
c) Secretary
d) Treasurer
e) Business Manager
f) Auditor

Section 2: Duties of Officers

President:
- Preside over all meetings
- Represent GCFAS in official capacities
- Coordinate the work of all officers and committees
- Call special meetings as needed

Vice President:
- Assist the President in all duties
- Assume duties of President in their absence
- Chair committees as assigned

Secretary:
- Keep accurate minutes of all meetings
- Maintain official records and correspondence
- Handle official communications

Treasurer:
- Manage all financial matters
- Keep accurate financial records
- Prepare financial reports
- Collect and disburse funds

Business Manager:
- Oversee business operations
- Coordinate fundraising activities
- Manage association assets

Auditor:
- Review financial records annually
- Report findings to the General Assembly
- Ensure financial transparency`,
  },
  {
    id: 4,
    article: "Article IV",
    title: "Elections",
    content: `Section 1: Election Period
Elections shall be held annually during the last General Assembly of the academic year.

Section 2: Eligibility
Any member in good standing for at least one year may run for office.

Section 3: Term of Office
Officers shall serve for one academic year and may be re-elected for consecutive terms.

Section 4: Vacancies
If an office becomes vacant, a special election shall be held within 30 days.`,
  },
  {
    id: 5,
    article: "Article V",
    title: "Meetings",
    content: `Section 1: General Assembly
The General Assembly shall meet at least twice per semester.

Section 2: Special Meetings
Special meetings may be called by the President or upon written request of at least 25% of the membership.

Section 3: Quorum
A quorum for conducting business shall consist of at least 40% of the membership.

Section 4: Voting
Each member shall have one vote. Decisions shall be made by simple majority unless otherwise specified.`,
  },
  {
    id: 6,
    article: "Article VI",
    title: "Committees",
    content: `Section 1: Standing Committees
The following standing committees shall be established:
a) Academic Affairs Committee
b) Welfare Committee
c) Membership Committee
d) Finance Committee

Section 2: Special Committees
Special committees may be created by the President or General Assembly as needed.

Section 3: Committee Chairs
Committee chairs shall be appointed by the President with the approval of the Executive Board.`,
  },
  {
    id: 7,
    article: "Article VII",
    title: "Amendments",
    content: `Section 1: Proposal
Amendments to these bylaws may be proposed by:
a) Any member submitting a written proposal to the Executive Board
b) The Executive Board itself

Section 2: Notice
Proposed amendments must be submitted to all members at least 14 days before the vote.

Section 3: Adoption
Amendments require a two-thirds majority vote of members present at a General Assembly.

Section 4: Effective Date
Approved amendments shall take effect immediately unless otherwise specified.`,
  },
];

export default function MemberBylawsPage() {
  const [selectedSection, setSelectedSection] = useState<typeof bylawsSections[0] | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredSections = bylawsSections.filter(
    (section) =>
      section.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      section.article.toLowerCase().includes(searchTerm.toLowerCase()) ||
      section.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // If a section is selected, show detail view
  if (selectedSection) {
    return (
      <div className="flex flex-col gap-6 max-w-4xl mx-auto">
        {/* Back button */}
        <Button
          variant="ghost"
          onClick={() => setSelectedSection(null)}
          className="w-fit gap-2"
        >
          <ChevronLeft className="h-4 w-4" />
          Back to Bylaws
        </Button>

        {/* Article detail */}
        <Card>
          <CardHeader className="border-b">
            <div className="text-xs font-semibold text-primary uppercase tracking-wide mb-2">
              {selectedSection.article}
            </div>
            <CardTitle className="text-2xl font-bold text-foreground">
              {selectedSection.title}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="text-sm text-foreground whitespace-pre-line leading-relaxed">
              {selectedSection.content}
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <Card>
          <CardContent className="pt-4 text-xs text-muted-foreground">
            <p>
              For questions about this article or to propose amendments, please contact the 
              GCFAS Executive Board at{" "}
              <a href="mailto:gcfas@gordon.edu.ph" className="text-blue-600 hover:underline">
                gcfas@gordon.edu.ph
              </a>
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Grid view
  return (
    <div className="flex flex-col gap-6 max-w-6xl mx-auto">
      
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Constitution & Bylaws
        </h1>
        <p className="text-sm mt-1 text-muted-foreground">
          Official governing documents of the Gordon College Faculty Association Staff
        </p>
      </div>

      {/* Info banner */}
      <Card className="border-blue-200 bg-blue-50/50">
        <CardContent className="pt-4">
          <div className="flex gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-100">
              <BookOpen className="h-4 w-4 text-blue-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-blue-900">
                GCFAS Constitution & Bylaws
              </p>
              <p className="text-xs text-blue-700 mt-1">
                Click on any article below to view its full content. Last updated: June 2025
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Search bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search bylaws..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Articles grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredSections.map((section) => (
          <Card 
            key={section.id}
            className="cursor-pointer hover:shadow-lg transition-all hover:scale-[1.02] active:scale-[0.98]"
            onClick={() => setSelectedSection(section)}
          >
            <CardHeader>
              <div className="text-xs font-semibold text-primary uppercase tracking-wide mb-2">
                {section.article}
              </div>
              <CardTitle className="text-base font-semibold text-foreground leading-tight">
                {section.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground line-clamp-3">
                {section.content}
              </p>
              <div className="mt-4 text-xs font-medium text-primary hover:underline">
                Read full article →
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty state */}
      {filteredSections.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <BookOpen className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
            <p className="text-sm font-medium text-muted-foreground">
              No results found for "{searchTerm}"
            </p>
          </CardContent>
        </Card>
      )}

    </div>
  );
}