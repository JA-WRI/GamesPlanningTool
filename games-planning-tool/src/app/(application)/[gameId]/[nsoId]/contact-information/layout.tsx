import ContactsSideMenu from './components/ContactsSideMenu';

export default function ContactInfoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col md:flex-row min-h-screen">
      <ContactsSideMenu />
      <main className="flex-1 p-6 bg-white overflow-x-hidden">
        <div className="max-w-7xl mx-auto">{children}</div>
      </main>
    </div>
  );
}
