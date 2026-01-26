import { ContactNavbar, ContactTable } from "@/leads/components/contacts";

export const ContactEnrichmentPage = () => {
  return (
    <div className="flex flex-col h-full">
      <ContactNavbar />

      <div className="space-y-4 p-4 flex-1">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-foreground">Contacts</h1>
          <p className="text-muted-foreground mt-1">
            Manage your contact list with inline editing
          </p>
        </div>

        <ContactTable />
      </div>
    </div>
  );
};
