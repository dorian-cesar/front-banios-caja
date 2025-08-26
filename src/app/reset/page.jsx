import { Suspense } from "react";
import ResetClient from "./ResetClient";

// opcional: evita que Next intente prerender estático esta ruta
export const dynamic = "force-dynamic";

export default function Page() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center p-8">Cargando…</div>}>
            <ResetClient />
        </Suspense>
    );
}
