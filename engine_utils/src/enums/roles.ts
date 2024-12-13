export enum E_ROLE {
    SuperAdmin = "Super Admin",
    Admin = "Admin",
    Manager = "Manager",
    Lead = "Lead",
    Engineer = "Engineer"
}

export const RoleGroups = Object.freeze({
    Admins: [E_ROLE.SuperAdmin, E_ROLE.Admin, E_ROLE.Manager], // Only SA & Admin has access
    Managers: [E_ROLE.SuperAdmin, E_ROLE.Admin, E_ROLE.Manager], // Only Admin & Manager has access
    Leads: [E_ROLE.SuperAdmin, E_ROLE.Admin, E_ROLE.Manager, E_ROLE.Lead], // Only Admin, Manager & Lead has access
    All: [E_ROLE.SuperAdmin, E_ROLE.Admin, E_ROLE.Manager, E_ROLE.Lead, E_ROLE.Engineer] // Everyone has access
});
