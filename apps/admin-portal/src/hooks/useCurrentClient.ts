import { useParams } from "react-router-dom";
import { useClientsStore } from "@/store/clientsStore";

export function useCurrentClient() {
  const { clientId } = useParams<{ clientId: string }>();
  const clients = useClientsStore((s) => s.clients);
  return clientId ? clients.find((c) => c.id === clientId) : undefined;
}
