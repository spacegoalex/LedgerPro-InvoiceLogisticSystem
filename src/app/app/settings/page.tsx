import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function SettingsPage() {
  return (
    <div className="flex h-full flex-col gap-4 p-4">
      <h1 className="text-xl font-bold bg-gradient-to-r from-violet-600 to-fuchsia-600 bg-clip-text text-transparent">
        Settings
      </h1>
      <Card className="border-slate-200 shadow-sm">
        <CardHeader className="p-3">
          <CardTitle className="text-sm">What is Settings for?</CardTitle>
        </CardHeader>
        <CardContent className="p-3 pt-0 text-sm text-slate-600 space-y-2">
          <p>
            Settings is reserved for app-wide options you might want later, such as:
          </p>
          <ul className="list-disc list-inside space-y-1 text-slate-500">
            <li>Company name and logo (for invoices)</li>
            <li>Default currency or tax rate</li>
            <li>User profile and password</li>
            <li>Invoice number prefix (e.g. LP or LedgerPro)</li>
          </ul>
          <p className="pt-2">
            Nothing is required here to use the app. When we add these options, they will appear on this page.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
