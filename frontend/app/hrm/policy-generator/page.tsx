"use client";
import AppShell from "@/components/layout/AppShell";
import { useEffect, useState } from "react";
import api from "@/lib/api";
import {
  ShieldCheck, Plus, Save, Trash2, X, FileText, Clock,
  CheckSquare, Square, Loader2, BookOpen, DollarSign, Heart,
  AlarmClock, Handshake, AlertTriangle, Home, Scale, Copyright,
  Activity, Send, ChevronRight, Eye, Star, Upload, Edit3,
  ArrowLeft, Check, Lock
} from "lucide-react";

// ─── Policy Section Options ───────────────────────────────────────────────────
const POLICY_SECTIONS = [
  {
    id: "leave",
    label: "Leave Policy",
    icon: <AlarmClock size={20} />,
    color: "blue",
    desc: "Annual, sick, casual and emergency leave entitlements",
    content: `LEAVE POLICY – DefenseBlu Private Limited
Effective Date: April 1, 2024 | Version: 1.0

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. ANNUAL / PRIVILEGE LEAVE (PL)
   • All confirmed employees: 18 days per calendar year
   • Accrual: 1.5 days per month, credited on the 1st of each month
   • Maximum carry-forward: 30 days (excess lapses on Dec 31)
   • Encashment: Up to 15 days per year (subject to approval)
   • Minimum balance required to apply: 1 day

2. SICK LEAVE (SL)
   • Entitlement: 12 days per calendar year
   • Medical certificate mandatory for absences > 2 consecutive days
   • Sick leave cannot be carried forward or encashed
   • Exhausted sick leave treated as Loss of Pay (LOP)

3. CASUAL LEAVE (CL)
   • Entitlement: 6 days per calendar year
   • Cannot be clubbed with other leave types
   • Cannot be carried forward or encashed
   • Not applicable during probation period

4. BEREAVEMENT LEAVE
   • Immediate family (spouse, child, parent, sibling): 5 days
   • Extended family (grandparent, in-laws): 3 days
   • Documentation may be required

5. MATERNITY / PATERNITY LEAVE
   • Refer to the Maternity Policy for full entitlements
   • Paternity leave: 5 working days within 3 months of childbirth

6. LEAVE APPLICATION PROCESS
   • Planned leave: Apply minimum 3 working days in advance via HRMS
   • Emergency leave: Notify manager within 4 hours of absence
   • Approval required from immediate manager + HR for leave > 5 days
   • Unauthorized absence > 2 consecutive days = LOP + disciplinary action

7. PUBLIC HOLIDAYS
   • 12 gazetted public holidays per year (list published each January)
   • 2 restricted holidays from the approved list (employee's choice)
   • Working on public holidays: compensatory off or 1.5x pay

This policy is subject to applicable Indian labour laws including the Shops and Establishments Act.`,
  },
  {
    id: "wages",
    label: "Wages and Payment Policy",
    icon: <DollarSign size={20} />,
    color: "emerald",
    desc: "Salary structure, payment schedule and deductions",
    content: `WAGES AND PAYMENT POLICY – DefenseBlu Private Limited
Effective Date: April 1, 2024 | Version: 1.0

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. SALARY STRUCTURE
   • Basic Salary: 40–50% of CTC
   • House Rent Allowance (HRA): 40% of Basic (non-metro) / 50% (metro)
   • Special Allowance: Balance of CTC components
   • Variable Pay: As per individual offer letter (performance-linked)
   • Provident Fund: 12% of Basic (employer + employee contribution each)

2. PAYMENT SCHEDULE
   • Salary disbursement: Last working day of each month
   • If last day is a bank holiday: previous working day
   • New joiners: Pro-rata salary in first month based on joining date
   • Salary credited via NEFT/IMPS to registered bank account only

3. SALARY COMPONENTS AND DEDUCTIONS
   Statutory Deductions:
   • Provident Fund (PF): 12% of Basic Salary
   • Professional Tax (PT): As per state-specific slab
   • Tax Deducted at Source (TDS): As per Income Tax Act, 1961
   • ESI (if applicable): 0.75% of gross wages (employees earning ≤ ₹21,000/month)

   Loss of Pay (LOP):
   • LOP = (Monthly Gross / Total working days) × LOP days
   • Applied for unauthorized absences or leave beyond entitlement

4. SALARY REVISION
   • Annual appraisal cycle: April–March
   • Revisions effective from April 1 each year
   • Off-cycle revisions require MD approval
   • Promotion increments paid from the date of promotion

5. OVERTIME POLICY
   • Non-exempt employees: Overtime at 1.5x hourly rate
   • Managerial/supervisory roles: Compensatory off or as per agreement
   • Overtime must be pre-approved by department head

6. SALARY ADVANCE
   • One salary advance per year (max 50% of monthly gross)
   • Repayment in maximum 3 EMIs
   • Application to HR with manager recommendation

7. FULL AND FINAL SETTLEMENT
   • F&F processed within 45 days of last working day
   • Includes: pending salary, earned leave encashment, gratuity (if applicable), bonus (pro-rata)
   • Deductions: Notice pay (if applicable), pending dues, asset recovery

This policy complies with the Payment of Wages Act 1936, Minimum Wages Act 1948, and applicable state laws.`,
  },
  {
    id: "maternity",
    label: "Maternity Policy",
    icon: <Heart size={20} />,
    color: "pink",
    desc: "Maternity benefits, leave and support provisions",
    content: `MATERNITY POLICY – DefenseBlu Private Limited
Effective Date: April 1, 2024 | Version: 1.0

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. ELIGIBILITY
   • Female employees who have worked for at least 80 days in the preceding 12 months
   • Applicable to biological mothers, adoptive mothers (child below 3 months), and commissioning mothers (surrogacy)

2. MATERNITY LEAVE ENTITLEMENT
   • First two pregnancies: 26 weeks of paid maternity leave
   • Third pregnancy onwards: 12 weeks of paid maternity leave
   • Adoption (child < 3 months): 12 weeks paid leave
   • Miscarriage / Medical termination: 6 weeks paid leave from date of event
   • Tubectomy: 2 weeks paid leave

3. LEAVE STRUCTURE
   • Pre-natal leave: Up to 8 weeks before expected delivery date
   • Post-natal leave: Remaining weeks after delivery
   • Extension: Additional 1 month unpaid leave available on medical grounds (doctor's certificate required)

4. PAY DURING MATERNITY LEAVE
   • Full pay (last drawn CTC) for the entire entitled period
   • No impact on annual leave accrual during maternity leave
   • Variable/performance pay excluded unless otherwise stated in offer letter

5. WORK FROM HOME PROVISIONS
   • Post-maternity: Option for WFH up to 3 months (subject to role suitability and manager approval)
   • Flexible working hours for 6 months post return (9:30 AM – 5:30 PM)
   • Gradual return-to-work program available on request

6. NURSING BREAKS
   • Two nursing breaks of 15 minutes each per day for 15 months post-delivery
   • Breaks to be mutually agreed with reporting manager

7. CRECHE FACILITY (where applicable)
   • Available at offices with 50+ employees
   • Employee contribution: ₹500/month; balance borne by company
   • Maximum 4 visits per day during working hours

8. JOB PROTECTION
   • Employer cannot give notice of dismissal during maternity leave
   • Position or equivalent role guaranteed upon return
   • Any change in employment terms requires written consent

9. APPLICATION PROCESS
   • Intimation to HR: At least 8 weeks before expected leave commencement
   • Documents: Medical certificate / Adoption order / Surrogacy agreement
   • Return-to-work plan to be discussed with HR 2 weeks before joining

This policy is aligned with the Maternity Benefit (Amendment) Act, 2017.`,
  },
  {
    id: "working",
    label: "Working Hours Policy",
    icon: <Clock size={20} />,
    color: "violet",
    desc: "Standard hours, shifts and overtime guidelines",
    content: `WORKING HOURS POLICY – DefenseBlu Private Limited
Effective Date: April 1, 2024 | Version: 1.0

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. STANDARD WORKING HOURS
   • Office hours: 9:30 AM to 6:30 PM, Monday to Saturday
   • Total working hours: 9 hours per day (including 1-hour lunch break)
   • Net working hours: 8 hours per day | 48 hours per week
   • Lunch break: 1:00 PM – 2:00 PM (mandatory; staggered as per team requirement)

2. FLEXIBILITY PROVISIONS
   • Flexi-window: Core hours are 10:30 AM – 5:00 PM (mandatory presence)
   • Employees may start between 9:00 AM – 10:30 AM with manager approval
   • Compensatory adjustment permitted within the same week

3. LATE ARRIVAL AND EARLY DEPARTURE
   • Grace period: 15 minutes (no deduction)
   • Late by 16–60 minutes: ½ day late mark
   • More than 3 late marks per month: 0.5 day LOP deduction
   • Early departure without approval: Treated equivalent to late arrival

4. OVERTIME
   • Applicable for non-managerial/supervisor roles only
   • Must be pre-approved by department head
   • Compensation: 1.5x hourly rate or compensatory off (employee's choice)
   • Overtime records maintained by HR; paid in following month's salary
   • Maximum overtime: 2 hours per day; 12 hours per week (as per Factories Act)

5. SHIFT WORK (if applicable)
   • Morning Shift: 7:00 AM – 4:00 PM
   • General Shift: 9:30 AM – 6:30 PM
   • Evening Shift: 2:00 PM – 11:00 PM
   • Night Shift: 10:00 PM – 7:00 AM (Night allowance: ₹150/night)
   • Shift rotation: 4-week cycle; 15 days notice for shift change

6. WEEKEND AND HOLIDAY WORK
   • Sunday work requires manager + HR approval
   • Compensatory off to be availed within 30 days
   • Working on gazetted holidays: 1.5x pay or 2 days compensatory off

7. BIOMETRIC / ATTENDANCE RECORDING
   • Attendance via biometric system (thumb + face recognition)
   • Failure to record attendance: Treated as absent unless manually approved
   • Remote workers: Attendance via HRMS login + manager daily standup check-in

This policy complies with the Shops and Establishments Act (Karnataka) and applicable state-specific regulations.`,
  },
  {
    id: "gratuity",
    label: "Gratuity Policy",
    icon: <Handshake size={20} />,
    color: "amber",
    desc: "Gratuity eligibility, calculation and payment",
    content: `GRATUITY POLICY – DefenseBlu Private Limited
Effective Date: April 1, 2024 | Version: 1.0

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. ELIGIBILITY
   • Minimum 5 continuous years of service with DefenseBlu
   • Applicable on: resignation, retirement, death, disablement due to accident/illness
   • In case of death or disablement: payable regardless of tenure

2. GRATUITY CALCULATION
   Formula: (Last drawn Basic Salary + DA) × 15 × Years of Service ÷ 26

   Example:
   • Basic + DA: ₹50,000/month
   • Years of service: 7 years
   • Gratuity = 50,000 × 15 × 7 ÷ 26 = ₹2,01,923

   Notes:
   • "Last drawn salary" = Basic + Dearness Allowance only
   • Service > 6 months in final year counted as full year
   • Maximum gratuity: ₹20,00,000 (as per Payment of Gratuity Act, 1972)
   • Tax exemption: Up to ₹20,00,000 for government employees; ₹20,00,000 for others (u/s 10(10))

3. FORFEITURE OF GRATUITY
   Gratuity may be wholly or partially forfeited if employment is terminated for:
   • Willful omission or negligence causing damage/loss to company property
   • Riotous/disorderly conduct or any act of violence
   • Moral turpitude
   (Forfeiture requires written show-cause notice and due inquiry)

4. PAYMENT PROCEDURE
   • Application: Form 'I' (employee) or Form 'J' (nominee/legal heir) to HR
   • Processing time: Within 30 days of application
   • Payment mode: NEFT to registered bank account
   • Nomination: Form 'F' to be submitted at time of joining; update on life events

5. GRATUITY INSURANCE
   • Company maintains group gratuity insurance with LIC of India
   • Employees are covered from date of confirmation

6. NOMINATION
   • Every employee must submit Form 'F' (nomination) within 30 days of joining
   • Changes to nomination: Form 'H' to HR
   • If no nomination and employee has family: gratuity paid to family members as per Act

This policy is governed by the Payment of Gratuity Act, 1972 and amendments thereto.`,
  },
  {
    id: "grievance",
    label: "Grievance Redressal Policy",
    icon: <AlertTriangle size={20} />,
    color: "red",
    desc: "Complaint escalation and resolution process",
    content: `GRIEVANCE REDRESSAL POLICY – DefenseBlu Private Limited
Effective Date: April 1, 2024 | Version: 1.0

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. OBJECTIVE
   To provide a fair, transparent, and timely mechanism for employees to raise workplace concerns, disputes, or dissatisfaction related to employment conditions, conduct, or management decisions.

2. SCOPE
   Applicable to all employees (permanent, contractual, probationary) across all DefenseBlu office locations.

3. TYPES OF GRIEVANCES
   • Salary/compensation disputes
   • Leave, attendance, or appraisal discrepancies
   • Interpersonal conflicts or workplace harassment
   • Discrimination based on caste, gender, religion, disability
   • Unsafe working conditions
   • Violation of company policy

4. GRIEVANCE RESOLUTION PROCESS

   STEP 1 – INFORMAL RESOLUTION (within 3 working days)
   Employee raises concern verbally with immediate manager.
   Manager acknowledges and attempts informal resolution.

   STEP 2 – FORMAL WRITTEN GRIEVANCE (if Step 1 unresolved)
   Employee submits Grievance Form (HR-GRV-01) to HR within 7 days of incident.
   HR acknowledges receipt within 24 hours.

   STEP 3 – HR INVESTIGATION (within 10 working days)
   HR Grievance Officer conducts inquiry: statements, evidence, witnesses.
   Preliminary findings shared with both parties.

   STEP 4 – GRIEVANCE COMMITTEE REVIEW (if required)
   Committee: HR Head + Senior Manager (neutral) + Employee representative
   Hearing conducted; decision communicated within 5 working days.

   STEP 5 – APPEAL TO MANAGEMENT (within 7 days of committee decision)
   If dissatisfied, appeal to Managing Director.
   Final decision communicated within 15 days. Decision is binding.

5. POSH COMMITTEE (Prevention of Sexual Harassment)
   • Separate Internal Complaints Committee (ICC) as per POSH Act, 2013
   • Complaints submitted to ICC Presiding Officer (designated senior female employee)
   • Investigation: 90-day timeline as per law
   • Full confidentiality maintained

6. NON-RETALIATION POLICY
   No employee shall face adverse action for raising a grievance in good faith.
   Victimization of a complainant is a disciplinary offense.

7. CONFIDENTIALITY
   All grievance proceedings are strictly confidential.
   Breach of confidentiality by any party is a serious disciplinary matter.

8. RECORDS
   All grievance records maintained for 3 years.
   HR maintains a grievance register (updated quarterly).

This policy is compliant with the Industrial Disputes Act, 1947 and POSH Act, 2013.`,
  },
  {
    id: "remote",
    label: "Remote Work / Hybrid Policy",
    icon: <Home size={20} />,
    color: "teal",
    desc: "Work-from-home eligibility and guidelines",
    content: `REMOTE WORK / HYBRID POLICY – DefenseBlu Private Limited
Effective Date: April 1, 2024 | Version: 1.0

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. POLICY STATEMENT
   DefenseBlu supports flexible work arrangements that maintain productivity, collaboration, and professional standards while supporting employee work-life balance.

2. ELIGIBILITY CRITERIA
   • Confirmed employees (post-probation) in eligible roles
   • Performance rating of "Meets Expectations" or above in last appraisal
   • Not under a Performance Improvement Plan (PIP)
   • Role does not require mandatory physical presence (e.g., front desk, facility management)

3. HYBRID WORK MODEL
   Standard Hybrid Schedule:
   • Office days: Tuesday, Wednesday, Thursday (mandatory)
   • WFH days: Monday and Friday (optional, subject to manager approval)
   • Maximum WFH: 8 days per month for non-remote roles

   Team Anchor Days:
   • Each team may designate specific "anchor days" for all-hands office presence
   • Anchor days override personal WFH schedules

4. FULL REMOTE WORK
   • Available for specific roles designated as "Remote Eligible" in offer letter
   • Quarterly in-person visits to office required (travel reimbursed as per policy)
   • Remote employees must be available during core hours: 10:30 AM – 5:00 PM IST

5. HOME OFFICE REQUIREMENTS
   Employee Responsibilities:
   • Stable internet connection (min. 25 Mbps broadband)
   • Dedicated workspace free from distractions
   • Company-issued laptop/equipment (personal devices require IT approval)
   • VPN connection mandatory for accessing company systems

   Company Provides:
   • Laptop and required peripherals
   • Licensed software and VPN access
   • IT support (remote helpdesk)
   • One-time home office allowance: ₹5,000 (for confirmed WFH roles)

6. ATTENDANCE AND AVAILABILITY
   • WFH employees log in via HRMS by 9:45 AM
   • Daily check-in with manager (standup or message)
   • Response time for emails/messages: within 30 minutes during core hours
   • Unresponsive for >2 hours without notice: treated as half-day leave

7. DATA SECURITY WHILE REMOTE
   • No work on public Wi-Fi without VPN
   • No printing/storage of confidential data on personal devices
   • Clear screen lock when stepping away
   • Immediate reporting of data breach/loss to IT

8. REVOCATION OF REMOTE PRIVILEGES
   Remote work privileges may be revoked for:
   • Repeated unavailability during working hours
   • Data security violations
   • Performance decline linked to remote work
   • Business-critical project requirements

This policy is subject to review every 6 months based on operational needs.`,
  },
  {
    id: "code",
    label: "Code of Conduct",
    icon: <Scale size={20} />,
    color: "slate",
    desc: "Professional behavior and workplace standards",
    content: `CODE OF CONDUCT – DefenseBlu Private Limited
Effective Date: April 1, 2024 | Version: 1.0

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. PROFESSIONAL BEHAVIOR
   All employees are expected to:
   • Maintain dignity, respect, and courtesy in all interactions
   • Represent DefenseBlu professionally in client-facing situations
   • Dress appropriately (business casual; smart casuals on Fridays)
   • Avoid use of mobile phones during client meetings or presentations
   • Use professional language in written and verbal communication

2. CONFIDENTIALITY AND DATA PROTECTION
   • Client information, pricing, and business strategies are strictly confidential
   • No disclosure of company data to third parties or on social media
   • All employees sign NDA (Non-Disclosure Agreement) at time of joining
   • Proprietary data to be handled per the company's Data Classification Policy
   • Post-employment confidentiality obligation: 2 years

3. CONFLICT OF INTEREST
   Employees must disclose and avoid:
   • Holding financial interest in competitor/client companies
   • Moonlighting (secondary employment without prior written approval)
   • Personal relationships that influence professional decisions
   • Accepting gifts > ₹2,000 in value from vendors/clients
   • Disclosure required via Conflict of Interest Declaration Form (HR-COI-01)

4. ANTI-HARASSMENT AND ANTI-DISCRIMINATION
   DefenseBlu has zero tolerance for:
   • Sexual harassment (refer to POSH Policy)
   • Bullying, intimidation, or verbal/physical abuse
   • Discrimination based on gender, religion, caste, disability, age, or sexual orientation
   Violations must be reported immediately to HR or ICC.

5. WORKPLACE SAFETY AND CONDUCT
   • No consumption of alcohol/substances on company premises
   • Violence or threat of violence: immediate termination
   • Respect for company property; no misuse or vandalism
   • Report unsafe conditions to Facilities/Admin immediately

6. SOCIAL MEDIA GUIDELINES
   • No posting of confidential company/client information online
   • Personal opinions that could damage DefenseBlu's reputation are prohibited
   • Endorsements related to work require prior approval from Marketing/PR
   • Employees must not impersonate the company or its leadership

7. ETHICAL BUSINESS PRACTICES
   • No falsification of records, expenses, or reports
   • No fraudulent claims (travel, reimbursement, attendance)
   • Procurement decisions must follow vendor policy; no kickbacks accepted
   • Whistle-blower protection for good-faith reporting of violations

8. DISCIPLINARY FRAMEWORK
   Level 1 (Minor violations): Verbal warning → Written warning
   Level 2 (Moderate violations): Final written warning → Suspension without pay
   Level 3 (Serious violations): Termination with notice
   Level 4 (Gross misconduct): Summary termination (without notice/compensation)

   All disciplinary proceedings follow principles of natural justice.

This policy is subject to review annually and is binding on all employees.`,
  },
  {
    id: "ip",
    label: "Intellectual Property Policy",
    icon: <Copyright size={20} />,
    color: "purple",
    desc: "IP ownership and confidentiality terms",
    content: `INTELLECTUAL PROPERTY POLICY – DefenseBlu Private Limited
Effective Date: April 1, 2024 | Version: 1.0

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. OWNERSHIP OF INTELLECTUAL PROPERTY
   All Intellectual Property (IP) created by an employee during their employment, using company resources, or related to the company's business belongs exclusively to DefenseBlu Private Limited. This includes:
   • Software, code, algorithms, and databases
   • Business models, frameworks, methodologies
   • Reports, presentations, proposals, client deliverables
   • Inventions, designs, processes, and trade secrets
   • Marketing materials and brand assets

2. ASSIGNMENT OF IP
   • Employees assign all IP rights created during employment to DefenseBlu at the time of creation
   • This assignment is automatic and requires no separate documentation
   • Employees must promptly disclose any IP created to their manager and HR
   • Employees must execute any documents required to perfect ownership rights

3. PRE-EXISTING IP
   • Employees retain ownership of IP created before joining DefenseBlu
   • Pre-existing IP must be disclosed in writing at time of joining (Form HR-IP-01)
   • Use of pre-existing IP in company work requires written consent from both parties

4. CONFIDENTIAL INFORMATION
   Definition: Any non-public information including but not limited to:
   • Client data, pricing, contracts, and business relationships
   • Financial data, projections, and strategic plans
   • Personnel information and compensation details
   • Proprietary processes, templates, and methodologies
   • Technical data, source code, and system architecture

   Obligations:
   • Maintain strict confidentiality during and after employment
   • Access on need-to-know basis only
   • Store confidential data only on approved company systems
   • Immediately return all confidential materials upon separation

5. POST-EMPLOYMENT OBLIGATIONS
   Duration: 2 years post-employment
   Prohibited Activities:
   • Using company's confidential information for personal gain or benefit of competitors
   • Recruiting company employees or soliciting clients for competing business
   • Misrepresenting prior work product as independently developed IP

   Non-Compete (if applicable as per offer letter):
   • 12-month restriction on working with direct competitors in same domain
   • Geographic scope: India
   • In consideration of specific compensation (as outlined in offer letter)

6. USE OF THIRD-PARTY IP
   • Use of open-source software must comply with applicable license terms
   • Third-party licensed software requires IT/Legal approval before use
   • Employees must not incorporate copyrighted third-party material without license
   • Any suspected infringement must be reported to Legal/HR immediately

7. IP VIOLATIONS
   • Unauthorized use or disclosure of company IP: immediate disciplinary action
   • Civil/criminal liability may be pursued under:
     - Copyright Act, 1957
     - Patents Act, 1970
     - Information Technology Act, 2000
     - Indian Contract Act, 1872

8. REPORTING IP CONCERNS
   Report suspected IP violations to: legal@defenseblu.com or HR
   All reports treated confidentially; no retaliation for good-faith reports.

This policy is legally binding and forms part of the employment contract.`,
  },
  {
    id: "health",
    label: "Health & Safety Policy",
    icon: <Activity size={20} />,
    color: "green",
    desc: "Workplace safety standards and procedures",
    content: `HEALTH & SAFETY POLICY – DefenseBlu Private Limited
Effective Date: April 1, 2024 | Version: 1.0

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. POLICY STATEMENT
   DefenseBlu is committed to providing a safe, healthy, and hazard-free work environment for all employees, contractors, and visitors. The company complies with all applicable health and safety legislation and strives to exceed minimum legal requirements.

2. MANAGEMENT RESPONSIBILITIES
   • Provide adequate resources for health and safety programs
   • Conduct annual risk assessments of all work areas
   • Ensure all incidents are investigated and corrective actions implemented
   • Appoint a designated Health & Safety Officer at each office location
   • Ensure compliance with the Occupational Safety, Health and Working Conditions Code, 2020

3. EMPLOYEE RESPONSIBILITIES
   Every employee must:
   • Follow all health and safety rules and procedures
   • Use prescribed Personal Protective Equipment (PPE) where required
   • Report unsafe conditions, near-misses, or accidents to Facilities/HR immediately
   • Participate in safety training and emergency drills
   • Not misuse or interfere with safety equipment

4. WORKPLACE SAFETY MEASURES
   Physical Safety:
   • Regular maintenance of electrical installations, lifts, and equipment
   • Clear and unobstructed emergency exit routes (marked with green signage)
   • Fire extinguishers inspected every 6 months; smoke detectors tested monthly
   • First aid kits stocked and accessible at each floor
   • Ergonomic workstation assessments available on request

   Ergonomics:
   • Adjustable chairs and monitor stands provided
   • Employees encouraged to take a 5-minute break every hour
   • Screen glare assessment and anti-glare filters available

5. EMERGENCY PROCEDURES
   Fire Emergency:
   • On hearing alarm: stop work, secure data, evacuate via nearest fire exit
   • Do NOT use lifts during evacuation
   • Assembly point: [Designated area – refer building notice board]
   • Roll call by floor wardens; report missing persons to Emergency Coordinator

   Medical Emergency:
   • Call ambulance: 108; notify HR and Admin immediately
   • First Aiders list posted at reception and on intranet
   • AED (Automated External Defibrillator) available at [location]

6. MENTAL HEALTH AND WELLNESS
   • Employee Assistance Program (EAP): Free, confidential counseling (4 sessions/year)
   • Mental Health Day: 2 additional days off per year (no questions asked)
   • Stress-at-work reporting: anonymous channel via HR portal
   • Awareness sessions on mental health conducted quarterly

7. SUBSTANCE ABUSE POLICY
   • Zero tolerance: alcohol, narcotics, or illegal substances on premises
   • Prescribed medications that may impair judgment: disclose to HR
   • Violation: immediate suspension pending investigation

8. HEALTH BENEFITS
   • Group Medical Insurance: ₹3,00,000 sum insured (employee + family)
   • Annual health checkup: All employees above 30 years
   • Subsidized gym membership at partner facilities
   • Flu vaccination drive: Conducted annually (October)

9. INCIDENT REPORTING
   All incidents (accidents, near-misses, unsafe conditions):
   • Report within 24 hours using Form HR-HS-01
   • Serious injuries: Immediate verbal report + Form within 4 hours
   • Records maintained for 5 years
   • Monthly safety summary shared with leadership

This policy is governed by the Occupational Safety, Health and Working Conditions Code, 2020 and Factories Act, 1948.`,
  },
  {
    id: "antibribery",
    label: "Anti-Bribery Policy",
    icon: <ShieldCheck size={20} />,
    color: "orange",
    desc: "Anti-corruption and ethical conduct standards",
    content: `ANTI-BRIBERY AND ANTI-CORRUPTION POLICY – DefenseBlu Private Limited
Effective Date: April 1, 2024 | Version: 1.0

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. POLICY STATEMENT
   DefenseBlu Private Limited is committed to conducting all business activities with integrity, honesty, and in full compliance with applicable anti-corruption laws. Bribery and corruption are illegal and unethical, and will not be tolerated in any form.

2. SCOPE
   This policy applies to:
   • All employees, directors, officers, and partners
   • Contractors, consultants, and third-party agents acting on DefenseBlu's behalf
   • All business activities in India and internationally

3. DEFINITIONS
   Bribe: Offering, giving, receiving, or soliciting something of value to influence a business or government decision improperly.
   Facilitation Payment: A small payment to a government official to expedite routine processes (prohibited by this policy even if locally common).
   Kickback: A payment made in return for a favorable contract or decision.

4. PROHIBITED CONDUCT
   The following are strictly prohibited:
   • Offering or paying bribes to government officials or private individuals
   • Accepting bribes or kickbacks from vendors, clients, or any third party
   • Making or receiving facilitation payments
   • Causing another person to commit bribery on behalf of DefenseBlu
   • Approving purchases or contracts in exchange for personal benefit
   • Falsifying records to conceal improper payments

5. GIFTS AND HOSPITALITY
   Permissible:
   • Gifts ≤ ₹2,000 in value (branded merchandise, sweets during festivals)
   • Business meals ≤ ₹3,000 per person (when business is discussed)
   • Corporate event invitations (pre-approved by HR)

   Prohibited:
   • Cash gifts in any amount
   • Gifts that could be perceived as influencing a business decision
   • Any gift to a government official (regardless of value)
   • Gifts during procurement/tender processes
   All gifts received > ₹2,000 must be declared via Form HR-AB-01 within 48 hours.

6. CHARITABLE DONATIONS AND SPONSORSHIPS
   • All corporate donations require MD approval
   • No donations to political parties or candidates
   • Donations must not be structured to conceal improper payments
   • CSR activities governed separately by the CSR Policy

7. DUE DILIGENCE ON THIRD PARTIES
   • All agents, distributors, and third parties must complete due diligence screening
   • Third-party contracts must include anti-bribery compliance clauses
   • HR/Legal maintains a risk register of high-risk third-party relationships

8. RECORD KEEPING
   • Accurate books and records reflecting all transactions
   • No off-the-books accounts or transactions
   • Expense claims must be truthful; false claims constitute fraud
   • Finance reviews unusual payments or expenses quarterly

9. REPORTING VIOLATIONS (WHISTLE-BLOWER PROTECTION)
   Report concerns to:
   • Compliance Officer: compliance@defenseblu.com
   • Anonymous hotline: [number/web portal]
   • Directly to MD if senior management is involved

   Protections:
   • Full confidentiality for reporters acting in good faith
   • No retaliation, demotion, or adverse action against reporter
   • False/malicious reports: disciplinary action

10. CONSEQUENCES OF VIOLATION
    • Disciplinary action up to and including summary dismissal
    • Civil and criminal liability under:
      - Prevention of Corruption Act, 1988 (amended 2018)
      - Indian Penal Code (Section 171B, 171E)
      - Foreign Corrupt Practices Act (if US business involved)
      - UK Bribery Act (if UK business involved)

This policy is reviewed annually by HR, Finance, and Legal.`,
  },
  {
    id: "attendance",
    label: "Attendance Policy",
    icon: <BookOpen size={20} />,
    color: "cyan",
    desc: "Attendance tracking, punctuality and absence rules",
    content: `ATTENDANCE POLICY – DefenseBlu Private Limited
Effective Date: April 1, 2024 | Version: 1.0

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. WORKING SCHEDULE
   • Working days: Monday to Saturday
   • Standard hours: 9:30 AM – 6:30 PM (9 hours; 1-hour lunch break)
   • Net working hours: 8 hours/day | 48 hours/week
   • Alternate Saturday policy: 2nd and 4th Saturdays are working; 1st, 3rd, 5th are off (as notified)

2. ATTENDANCE RECORDING SYSTEM
   • Biometric system (fingerprint + face ID) at all office entry points
   • Remote employees: HRMS login + daily standup acknowledgment
   • Employees must mark attendance personally; proxy attendance is prohibited
   • System records: Login time, logout time, total hours, and break durations

3. PUNCTUALITY STANDARDS
   Grace Period: 15 minutes (9:30 – 9:45 AM, no action)
   Late Arrival (9:46 AM onwards):
   • 1st–2nd instance/month: Email reminder from HR
   • 3rd instance: Written warning
   • 4th instance: ½ day LOP deduction
   • 5th+ instance: Full day LOP + disciplinary review

   Early Departure:
   • Leaving before 6:00 PM without approval: treated as half-day absence
   • Must inform manager + update HRMS

4. ABSENCE MANAGEMENT
   Planned Absence:
   • Apply for leave via HRMS at least 3 working days in advance
   • Approval required before absence; non-approval = unauthorized absence

   Unplanned/Emergency Absence:
   • Inform manager via call/WhatsApp within 1 hour of shift start
   • Email/HRMS update by end of day
   • Medical certificate required if 2+ consecutive days

   Unauthorized Absence:
   • No intimation for 1 day: Warning + LOP
   • No intimation for 2 consecutive days: LOP + written warning
   • No intimation for 3+ consecutive days: Treated as abandonment; HR initiates inquiry

5. LEAVE YEAR AND ACCRUAL
   • Leave year: January 1 to December 31
   • Leave credited on the 1st of each month
   • New joiners: Pro-rata leave from joining month
   • Probationers: Eligible for CL and SL only; no PL during probation

6. COMPENSATORY OFF (COMP-OFF)
   • Earned on working Sundays/holidays (pre-approved)
   • Must be availed within 45 days; expires after that
   • Maximum 4 comp-offs can be accumulated at any time
   • Comp-offs cannot be carried forward to next year

7. ATTENDANCE AND SALARY
   Monthly deduction formula:
   LOP Deduction = (Gross Monthly Salary ÷ Total Calendar Days) × LOP Days

   Attendance Bonus:
   • 100% attendance in a quarter: ₹1,000 bonus in next salary
   • 100% attendance for full year: ₹5,000 bonus in March salary

8. ATTENDANCE REVIEW
   • HR reviews attendance monthly; report shared with department heads
   • Employees with >15% absence in a quarter placed under Performance Watch
   • Consistent poor attendance addressed in annual appraisal (affects increment)

9. SPECIAL CIRCUMSTANCES
   • Employees stranded due to natural disasters, curfew, or public transport strike: Not treated as absence (documentary proof required)
   • COVID/infectious disease isolation: Treated as medical leave with doctor certificate

This policy is effective from the date of joining and is subject to annual review.`,
  },
];

const COLOR_MAP: Record<string, { bg: string; text: string; border: string; badge: string }> = {
  blue: { bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200", badge: "bg-blue-100 text-blue-700" },
  emerald: { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200", badge: "bg-emerald-100 text-emerald-700" },
  pink: { bg: "bg-pink-50", text: "text-pink-700", border: "border-pink-200", badge: "bg-pink-100 text-pink-700" },
  violet: { bg: "bg-violet-50", text: "text-violet-700", border: "border-violet-200", badge: "bg-violet-100 text-violet-700" },
  amber: { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200", badge: "bg-amber-100 text-amber-700" },
  red: { bg: "bg-red-50", text: "text-red-700", border: "border-red-200", badge: "bg-red-100 text-red-700" },
  teal: { bg: "bg-teal-50", text: "text-teal-700", border: "border-teal-200", badge: "bg-teal-100 text-teal-700" },
  slate: { bg: "bg-slate-50", text: "text-slate-700", border: "border-slate-200", badge: "bg-slate-100 text-slate-700" },
  purple: { bg: "bg-purple-50", text: "text-purple-700", border: "border-purple-200", badge: "bg-purple-100 text-purple-700" },
  green: { bg: "bg-green-50", text: "text-green-700", border: "border-green-200", badge: "bg-green-100 text-green-700" },
  orange: { bg: "bg-orange-50", text: "text-orange-700", border: "border-orange-200", badge: "bg-orange-100 text-orange-700" },
  cyan: { bg: "bg-cyan-50", text: "text-cyan-700", border: "border-cyan-200", badge: "bg-cyan-100 text-cyan-700" },
};

type SubView = "portal" | "saved" | "draft";
type EditorMode = "new" | "edit" | "view";

export default function PolicyGeneratorPage() {
  const [subView, setSubView] = useState<SubView>("portal");
  const [policies, setPolicies] = useState<any[]>([]);
  const [selected, setSelected] = useState<any>(null);
  const [content, setContent] = useState("");
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("HR");
  const [saving, setSaving] = useState(false);
  const [showEditor, setShowEditor] = useState(false);
  const [editorMode, setEditorMode] = useState<EditorMode>("new");

  // Policy selector modal
  const [showModal, setShowModal] = useState(false);
  const [selectedSection, setSelectedSection] = useState<string | null>(null);

  useEffect(() => {
    api.get("/policies").then(r => setPolicies(r.data)).catch(() => { });
  }, []);

  // ── Load selected policy template ──
  const startFromTemplate = (templateId: string) => {
    const template = POLICY_SECTIONS.find(s => s.id === templateId);
    if (!template) return;
    setTitle(template.label);
    setCategory("HR");
    setContent(template.content);
    setSelected({ id: null });
    setEditorMode("new");
    setShowEditor(true);
    setShowModal(false);
    setSelectedSection(null);
  };

  // ── Save / Publish ──
  const save = async () => {
    setSaving(true);
    try {
      const payload = { title, content, category, published: true };
      if (selected?.id) {
        const r = await api.put(`/policies/${selected.id}`, payload);
        setPolicies(ps => ps.map(p => p.id === selected.id ? r.data : p));
        setSelected(r.data);
      } else {
        const r = await api.post("/policies", payload);
        setPolicies(ps => [r.data, ...ps]);
        setSelected(r.data);
      }
      setShowEditor(false);
      setSubView("saved");
    } catch { }
    finally { setSaving(false); }
  };

  const saveDraft = async () => {
    setSaving(true);
    try {
      const payload = { title, content, category, published: false };
      if (selected?.id) {
        const r = await api.put(`/policies/${selected.id}`, payload);
        setPolicies(ps => ps.map(p => p.id === selected.id ? r.data : p));
        setSelected(r.data);
      } else {
        const r = await api.post("/policies", payload);
        setPolicies(ps => [r.data, ...ps]);
        setSelected(r.data);
      }
      setShowEditor(false);
      setSubView("draft");
    } catch { }
    finally { setSaving(false); }
  };

  const publish = async (id: string) => {
    const r = await api.patch(`/policies/${id}/publish`);
    setPolicies(ps => ps.map(p => p.id === id ? r.data : p));
  };

  const unpublish = async (id: string) => {
    const r = await api.patch(`/policies/${id}/unpublish`);
    setPolicies(ps => ps.map(p => p.id === id ? r.data : p));
  };

  const del = async (id: string) => {
    if (!confirm("Delete this policy?")) return;
    await api.delete(`/policies/${id}`);
    setPolicies(ps => ps.filter(p => p.id !== id));
    if (selected?.id === id) { setSelected(null); setShowEditor(false); }
  };

  const loadSaved = (p: any) => {
    setSelected(p); setContent(p.content);
    setTitle(p.title); setCategory(p.category);
    setEditorMode("view");
    setShowEditor(true);
  };

  const editSaved = (p: any) => {
    setSelected(p); setContent(p.content);
    setTitle(p.title); setCategory(p.category);
    setEditorMode("edit");
    setShowEditor(true);
  };

  const drafts = policies.filter(p => !p.published);
  const published = policies.filter(p => p.published);

  // ─── Sidebar ──────────────────────────────────────────────────────────────
  const SideNav = () => (
    <div className="card p-3 space-y-1 text-sm">
      <button
        onClick={() => { setSubView("portal"); setShowEditor(false); }}
        className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg font-semibold transition-all
          ${subView === "portal" ? "bg-navy text-white" : "text-navy hover:bg-navy/10"}`}
      >
        <ShieldCheck size={15} /> HR Policy Portal
      </button>
      <button
        onClick={() => { setSubView("saved"); setShowEditor(false); }}
        className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg transition-all
          ${subView === "saved" ? "bg-navy/10 text-navy font-semibold" : "text-slate-600 hover:bg-slate-100"}`}
      >
        <FileText size={14} /> Saved Policies
        {published.length > 0 && (
          <span className="ml-auto text-xs bg-navy text-white rounded-full px-2">{published.length}</span>
        )}
      </button>
      <button
        onClick={() => { setSubView("draft"); setShowEditor(false); }}
        className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg transition-all
          ${subView === "draft" ? "bg-navy/10 text-navy font-semibold" : "text-slate-600 hover:bg-slate-100"}`}
      >
        <Clock size={14} /> Draft
        {drafts.length > 0 && (
          <span className="ml-auto text-xs bg-amber-400 text-white rounded-full px-2">{drafts.length}</span>
        )}
      </button>
    </div>
  );

  // ─── Policy Portal ────────────────────────────────────────────────────────
  const PortalView = () => (
    <div className="space-y-5">
      {/* Create New Policy button */}
      <div className="card bg-gradient-to-r from-navy to-navy/80 text-white flex items-center justify-between p-5">
        <div>
          <h3 className="font-bold text-lg">Create New HR Policy</h3>
          <p className="text-white/70 text-sm mt-0.5">Choose from 12 professional policy templates</p>
        </div>
        <button
          className="flex items-center gap-2 bg-white text-navy font-bold px-5 py-2.5 rounded-xl hover:bg-cream transition-all shadow-md"
          onClick={() => setShowModal(true)}
        >
          <Plus size={16} /> New Policy
        </button>
      </div>

      {/* Policy Grid */}
      <div className="card">
        <h4 className="font-bold text-navy text-sm mb-4 uppercase tracking-widest">Select a Template to Start</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
          {POLICY_SECTIONS.map(sec => {
            const colors = COLOR_MAP[sec.color] || COLOR_MAP.blue;
            const existing = policies.find(p => p.title === sec.label);
            
            return (
              <div
                key={sec.id}
                className={`flex flex-col p-4 rounded-xl border-2 transition-all group relative ${colors.border} ${colors.bg}`}
              >
                <div className={`w-9 h-9 rounded-lg bg-white/80 flex items-center justify-center mb-3 ${colors.text} group-hover:scale-110 transition-transform`}>
                  {sec.icon}
                </div>
                <div className={`font-semibold text-sm ${colors.text} mb-1`}>{sec.label}</div>
                <div className="text-xs text-slate-500 line-clamp-2 mb-4">{sec.desc}</div>
                
                <div className="mt-auto flex gap-2">
                  {existing ? (
                    <button 
                      onClick={() => editSaved(existing)}
                      className="flex-1 text-center py-2 bg-white/80 hover:bg-white text-navy text-[10px] font-black uppercase tracking-widest rounded-lg border border-navy/10 transition-all"
                    >
                      Edit Existing
                    </button>
                  ) : (
                    <button 
                      onClick={() => startFromTemplate(sec.id)}
                      className={`flex-1 text-center py-2 text-white text-[10px] font-black uppercase tracking-widest rounded-lg transition-all shadow-sm
                        ${sec.color === 'emerald' ? 'bg-emerald-600' : 'bg-navy'}`}
                    >
                      Create Policy
                    </button>
                  )}
                  {existing && (
                    <button 
                      onClick={() => loadSaved(existing)}
                      className="p-2 bg-white/50 hover:bg-white rounded-lg text-navy transition-all"
                      title="View Only"
                    >
                      <Eye size={14} />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );

  // ─── List View ────────────────────────────────────────────────────────────
  const ListView = ({ items, emptyLabel }: { items: any[]; emptyLabel: string }) => (
    <div className="card">
      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-40 text-slate-400">
          <FileText size={32} className="mb-2 opacity-20" />
          <p className="text-sm">{emptyLabel}</p>
        </div>
      ) : (
        <div className="space-y-2">
          {items.map(p => (
            <div key={p.id}
              className="flex items-center justify-between p-4 rounded-xl border-2 border-transparent bg-cream hover:bg-cream-dark hover:border-navy/10 transition-all">
              <div className="flex-1 cursor-pointer" onClick={() => loadSaved(p)}>
                <div className="text-sm font-semibold text-navy">{p.title}</div>
                <div className="text-xs text-slate-400 mt-0.5">{p.category} · v{p.version}</div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium
                  ${p.published ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}`}>
                  {p.published ? "Published" : "Draft"}
                </span>
                {/* Edit */}
                <button onClick={() => editSaved(p)}
                  className="btn-icon text-navy hover:bg-navy/10" title="Edit">
                  <Edit3 size={13} />
                </button>
                {/* Publish / Unpublish */}
                {p.published ? (
                  <button onClick={() => unpublish(p.id)}
                    className="btn-icon text-amber-500 hover:bg-amber-50" title="Move to Draft">
                    <ArrowLeft size={13} />
                  </button>
                ) : (
                  <button onClick={() => publish(p.id)}
                    className="btn-icon text-green-600 hover:bg-green-50" title="Publish">
                    <Upload size={13} />
                  </button>
                )}
                {/* Delete */}
                <button onClick={() => del(p.id)}
                  className="btn-icon text-red-400 hover:bg-red-50" title="Delete">
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  // ─── Editor ───────────────────────────────────────────────────────────────
  const Editor = () => {
    const isView = editorMode === "view";
    return (
      <div className="card slide-in">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <button onClick={() => { setShowEditor(false); setSelected(null); }}
              className="btn-icon text-slate-400 hover:text-navy">
              <ArrowLeft size={16} />
            </button>
            <h3 className="font-bold text-navy">
              {isView ? "View Policy" : editorMode === "edit" ? "Edit Policy" : "New Policy"}
            </h3>
            {selected?.published && (
              <span className="text-xs bg-green-100 text-green-700 rounded-full px-2 py-0.5 flex items-center gap-1">
                <Check size={10} /> Published
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {isView && (
              <button
                className="btn-ghost text-sm py-1.5 px-3"
                onClick={() => setEditorMode("edit")}>
                <Edit3 size={13} /> Edit
              </button>
            )}
            <button onClick={() => { setShowEditor(false); setSelected(null); }} className="btn-icon">
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Fields */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div>
            <label className="label">Policy Title</label>
            <input className="input" value={title}
              onChange={e => setTitle(e.target.value)}
              disabled={isView} />
          </div>
          <div>
            <label className="label">Category</label>
            <select className="select" value={category}
              onChange={e => setCategory(e.target.value)}
              disabled={isView}>
              {["HR", "Compliance", "Finance", "IT", "Operations", "Other"].map(c =>
                <option key={c}>{c}</option>
              )}
            </select>
          </div>
        </div>

        <div>
          <label className="label">Policy Content</label>
          <textarea
            className={`textarea font-mono text-xs ${isView ? "bg-cream" : ""}`}
            rows={20}
            value={content}
            onChange={e => setContent(e.target.value)}
            readOnly={isView}
          />
        </div>

        {/* Action buttons */}
        {!isView && (
          <div className="flex gap-3 mt-5">
            {/* Save & Publish – premium */}
            <button
              className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-navy to-blue-700 text-white font-bold py-2.5 px-4 rounded-xl hover:opacity-90 transition-all shadow-md disabled:opacity-60"
              onClick={save}
              disabled={saving || !title || !content}
            >
              <Star size={15} className="fill-yellow-300 text-yellow-300" />
              {saving ? "Saving..." : editorMode === "edit" ? "Update & Publish" : "Save & Publish"}
            </button>

            {/* Save as Draft */}
            <button
              className="flex-1 flex items-center justify-center gap-2 bg-white border-2 border-slate-200 text-slate-700 font-semibold py-2.5 px-4 rounded-xl hover:bg-cream transition-all disabled:opacity-60"
              onClick={saveDraft}
              disabled={saving || !title || !content}
            >
              <Clock size={15} />
              Save as Draft
            </button>

            {/* Cancel */}
            <button
              className="flex items-center justify-center gap-1 border-2 border-slate-200 text-slate-500 py-2.5 px-4 rounded-xl hover:bg-slate-50 transition-all"
              onClick={() => { setShowEditor(false); setSelected(null); }}
            >
              <X size={15} />
            </button>
          </div>
        )}

        {/* View mode action bar */}
        {isView && (
          <div className="flex gap-3 mt-5">
            {!selected?.published && (
              <button
                className="flex items-center gap-2 bg-green-600 text-white font-semibold py-2.5 px-5 rounded-xl hover:bg-green-700 transition-all"
                onClick={() => publish(selected.id).then(() => { setShowEditor(false); setSubView("saved"); })}
              >
                <Upload size={15} /> Publish
              </button>
            )}
            {selected?.published && (
              <button
                className="flex items-center gap-2 bg-amber-500 text-white font-semibold py-2.5 px-5 rounded-xl hover:bg-amber-600 transition-all"
                onClick={() => unpublish(selected.id).then(() => { setShowEditor(false); setSubView("draft"); })}
              >
                <ArrowLeft size={15} /> Move to Draft
              </button>
            )}
            <button
              className="flex items-center gap-2 border-2 border-red-200 text-red-500 font-semibold py-2.5 px-5 rounded-xl hover:bg-red-50 transition-all"
              onClick={() => del(selected.id)}
            >
              <Trash2 size={15} /> Delete
            </button>
          </div>
        )}
      </div>
    );
  };

  // ─── Policy Selector Modal ────────────────────────────────────────────────
  const PolicyModal = () => (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg flex flex-col" style={{ maxHeight: "90vh" }}>
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b">
          <h3 className="font-bold text-lg text-navy">Select HR Policy</h3>
          <button onClick={() => { setShowModal(false); setSelectedSection(null); }} className="btn-icon text-slate-400">
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 overflow-y-auto flex-1">
          <p className="text-sm text-slate-500 mb-4">
            Select a policy type to create. The editor will be pre-filled with professional content that you can customize.
          </p>
          <div className="space-y-2">
            {POLICY_SECTIONS.map(sec => {
              const colors = COLOR_MAP[sec.color] || COLOR_MAP.blue;
              const isSelected = selectedSection === sec.id;
              return (
                <button key={sec.id}
                  onClick={() => setSelectedSection(isSelected ? null : sec.id)}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl border-2 text-left transition-all
                    ${isSelected
                      ? `${colors.border} ${colors.bg}`
                      : "border-slate-200 hover:border-slate-300 bg-white"}`}
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0
                    ${isSelected ? `${colors.text} bg-white/80` : "bg-slate-100 text-slate-400"}`}>
                    {sec.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className={`text-sm font-semibold ${isSelected ? colors.text : "text-slate-700"}`}>
                      {sec.label}
                    </div>
                    <div className="text-xs text-slate-400 truncate">{sec.desc}</div>
                  </div>
                  {isSelected
                    ? <CheckSquare size={18} className={colors.text} />
                    : <Square size={18} className="text-slate-300" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="p-5 border-t flex items-center justify-between gap-3">
          <span className="text-xs text-slate-400">
            {selectedSection ? "1 policy selected" : "No policy selected"}
          </span>
          <button
            className="flex items-center gap-2 bg-navy text-white font-bold px-6 py-2.5 rounded-xl disabled:opacity-40 hover:bg-navy/90 transition-all"
            onClick={() => selectedSection && startFromTemplate(selectedSection)}
            disabled={!selectedSection}
          >
            <FileText size={15} /> Confirm & Start Editing
          </button>
        </div>
      </div>
    </div>
  );

  // ─── Main Layout ──────────────────────────────────────────────────────────
  return (
    <AppShell title="Policy Generator">
      {showModal && <PolicyModal />}

      <div className="mb-5">
        <h2 className="page-title">Policy Generator</h2>
        <p className="page-sub">Create and manage company HR policies</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-5">
        {/* Sidebar */}
        <div className="space-y-4">
          <SideNav />
          <button
            className="btn-primary w-full"
            onClick={() => { setShowModal(true); setSelectedSection(null); }}
          >
            <Plus size={14} /> New Policy
          </button>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3 space-y-5">
          {showEditor ? (
            <Editor />
          ) : subView === "portal" ? (
            <PortalView />
          ) : subView === "saved" ? (
            <>
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-bold text-navy">Saved Policies</h3>
                <button className="btn-primary text-sm py-1.5 px-4"
                  onClick={() => { setShowModal(true); setSelectedSection(null); }}>
                  <Plus size={13} /> New Policy
                </button>
              </div>
              <ListView items={published} emptyLabel="No published policies yet. Create and publish one!" />
            </>
          ) : (
            <>
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-bold text-navy">Draft Policies</h3>
                <button className="btn-primary text-sm py-1.5 px-4"
                  onClick={() => { setShowModal(true); setSelectedSection(null); }}>
                  <Plus size={13} /> New Draft
                </button>
              </div>
              <ListView items={drafts} emptyLabel="No drafts yet. Create a new policy and save as draft!" />
            </>
          )}
        </div>
      </div>
    </AppShell>
  );
}
