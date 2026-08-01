import Badge from "./Badge";

export default function AccountStatusBadge({ status }: { status?: string }) {
  if (!status) return <Badge variant="outline">Unknown</Badge>;
  switch (status.toLowerCase()) {
    case "active":
      return <Badge variant="success">Active</Badge>;
    case "pending activation":
      return <Badge variant="warning">Pending Activation</Badge>;
    case "invitationsent":
    case "invitation sent":
      return <Badge variant="warning">Invitation Sent</Badge>;
    case "inactive":
      return <Badge variant="danger">Inactive</Badge>;
    case "locked":
      return <Badge variant="danger">Locked</Badge>;
    case "disabled":
      return <Badge variant="danger">Disabled</Badge>;
    case "draft":
      return <Badge variant="outline">Draft</Badge>;
    case "emailverified":
    case "email verified":
      return <Badge variant="info">Email Verified</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
}