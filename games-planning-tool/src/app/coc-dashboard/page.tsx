type Status = "Submitted" | "In Progress" | "Completed" | "Not Started" | "Requires Update";
type NSO = {
    id:number;
    name:string;
    teamSize:Status;
    accreditation:Status;
    arrival:Status;
    departure:Status;
    completetion:Status;
};

const nsos: NSO[] = [
    {
        id: 1,
        name: "Badminton Canada",
        teamSize:"Submitted",
        accreditation:"Completed",
        arrival:"Requires Update",
        departure:"In Progress",
        completetion:"Not Started"
    },
    {
        id:2,
        name: "Archery Canada",
        teamSize:"Submitted",
        accreditation:"Not Started",
        arrival:"Not Started",
        departure:"Not Started",
        completetion:"Not Started"
    },
];



export default function CocDashboardPage() {
  return (
    <main>
      <h1>NSO&apos;s Progress Overview</h1>
    </main>
  );
}
