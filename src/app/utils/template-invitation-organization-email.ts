
export function templateInvitationOrganizationEmail(
    organizationName: string, 
    urlRedirect: string
) {
  return `
    <div style="font-family: Arial, sans-serif; background: #f9f9f9; padding: 32px;">
      <div style="max-width: 480px; margin: auto; background: #fff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.07); padding: 32px 24px;">
        <h2 style="color: #2d3748; text-align: center;">Convite para organização</h2>
        <p style="font-size: 16px; color: #4a5568; text-align: center;">
          Você foi convidado para participar da organização <b>${organizationName}</b>!
        </p>
        <div style="text-align: center; margin: 32px 0;">
          <a href="${urlRedirect}" style="display: inline-block; padding: 12px 32px; background: #3182ce; color: #fff; border-radius: 4px; text-decoration: none; font-weight: bold; font-size: 16px;">Aceitar convite</a>
        </div>
        <p style="font-size: 13px; color: #a0aec0; text-align: center;">
          Se você não esperava este convite, pode ignorar este email.
        </p>
      </div>
    </div>
  `;
}