// Admin email addresses for the application
export const adminEmails = [
  'macmoser@alumni.rice.edu',
  'km108@rice.edu',
  'cl202@rice.edu',
  'jjz3@rice.edu',
  'bi6@rice.edu',
  'beyza.ispir@rice.edu',
  'mk258@rice.edu'
];

// Helper function to check if a user is admin
export const isUserAdmin = (email) => {
  console.log('Checking admin status for email:', email);
  console.log('Admin emails list:', adminEmails);
  const isAdmin = email && adminEmails.includes(email);
  console.log('Is admin?', isAdmin);
  return isAdmin;
}; 