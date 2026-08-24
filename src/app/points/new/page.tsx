import { AppShell } from "@/components/app/app-shell";
import { PageHeader } from "@/components/app/page-header";
import { PointForm } from "./point-form";

export default function NewPointPage() {
  return (
    <AppShell>
      <PageHeader
        title="Agregar Punto Jet"
        description="Puedes crear un punto con direccion, coordenadas exactas o un link de Google Maps. Las imagenes referenciales se pueden agregar ahora o despues."
      />
      <div className="mx-auto max-w-3xl">
        <PointForm />
      </div>
    </AppShell>
  );
}
