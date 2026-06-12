export const calculateSalaryBreakdown = (annualCTC: number) => {
  const monthlyCTC = annualCTC / 12;
  
  // Basic is typically 40% to 50% of CTC
  const monthlyBasic = Math.round(monthlyCTC * 0.40);
  
  // HRA is typically 40% of Basic for non-metro, 50% for metro
  const monthlyHRA = Math.round(monthlyBasic * 0.40);
  
  // Retirals (Employer Contributions)
  const monthlyGratuity = Math.round(monthlyBasic * 0.0481); // 4.81%
  const monthlyEmployerPF = Math.round(monthlyBasic * 0.12); // 12%
  
  // Statutory Deductions (Employee)
  const monthlyEmployeePF = Math.round(monthlyBasic * 0.12);
  const monthlyPT = monthlyCTC > 15000 ? 200 : 0;
  
  // Gross Monthly Salary [a]
  // In many structures: CTC = Gross + Employer PF + Gratuity
  const monthlyGross = Math.round(monthlyCTC - (monthlyEmployerPF + monthlyGratuity));
  
  // Special Allowance
  const specialAllowance = Math.round(monthlyGross - (monthlyBasic + monthlyHRA));

  return {
    annualCTC,
    monthlyCTC: Math.round(monthlyCTC),
    grossMonthly: monthlyGross,
    earnings: [
      { name: "Basic Salary", value: monthlyBasic },
      { name: "House Rent Allowance (HRA)", value: monthlyHRA },
      { name: "Special Allowance", value: specialAllowance },
    ],
    deductions: [
      { name: "Provident Fund (Employee)", value: monthlyEmployeePF },
      { name: "Professional Tax", value: monthlyPT },
    ],
    employerContributions: [
      { name: "Provident Fund (Employer)", value: monthlyEmployerPF, note: "12% of Basic" },
      { name: "Gratuity", value: monthlyGratuity, note: "4.81% of Basic" },
    ],
    totalDeductions: monthlyEmployeePF + monthlyPT,
    totalEmployerContribution: monthlyEmployerPF + monthlyGratuity,
    netMonthly: monthlyGross - (monthlyEmployeePF + monthlyPT)
  };
};
