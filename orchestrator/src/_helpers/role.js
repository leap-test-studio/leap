const Roles = Object.freeze({
  Admin: "Admin",
  Manager: "Manager",
  Lead: "Lead",
  Engineer: "Engineer"
});

module.exports = {
  Admins: [Roles.Admin, Roles.Manager], // Only SA & Admin has access
  Managers: [Roles.Manager], // Only Admin & Manager has access
  Leads: [Roles.Admin, Roles.Manager, Roles.Lead], // Only Admin, Manager & Lead has access
  All: [Roles.Admin, Roles.Manager, Roles.Lead, Roles.Engineer] // Everyone has access
};

module.exports.Role = Roles;
