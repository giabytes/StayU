import React, { useState } from "react";
import CoordinatorDashboard from "./CoordinatorDashboard";
import ProgramDetailView from "./ProgramDetailView";

export default function ProgramStats({ report }) {
  const [selectedProgram, setSelectedProgram] = useState(null);

  const programData = selectedProgram ? report.programs.find(p => p.program === selectedProgram) : null;

  return (
    <>
      {selectedProgram && programData ? (
        <ProgramDetailView programData={programData} onBack={() => setSelectedProgram(null)} />
      ) : (
        <CoordinatorDashboard programs={report?.programs || []} onSelectProgram={setSelectedProgram} />
      )}
    </>
  );
}
