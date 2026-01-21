import  CreateApiKeyPage from "@/components/developer/api-keys/api-keys-creation";
import { ProtectedRoute } from "@/components/protected-route";
import { Separator } from "@radix-ui/react-dropdown-menu";

export default function ApiKeyCreationPage() {
    return (
        <ProtectedRoute>
            <div className="w-full p-4">
                <h1 className="text-xl font-semibold tracking-tight">
                    Create New API Key
                </h1>
                <p className="text-sm text-muted-foreground mt-1">
                    Create a new API key to securely access and interact with our APIs.
                </p>
                <Separator className="my-4 bg-muted-foreground/40 h-px" />
                {/* Form elements would go here */}
                <CreateApiKeyPage />
            </div>
        </ProtectedRoute>
    );
}