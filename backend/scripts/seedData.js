// Seed Data Script
// Kaam: Testing ke liye fake data create karna
// Chalane ka tarika: node scripts/seedData.js
//
// Ye data create karega:
//   - 5 Clients
//   - 10 Cases
//   - 5 Drafts
//   - 8 GST Filings
//   - 6 Tax Filings
//   - 4 Audits
//   - 10 Invoices

require("dotenv").config()
const mongoose = require("mongoose")

// Models
const Case = require("../models/lawyer/caseModel")
const Draft = require("../models/lawyer/draftModel")
const Gst = require("../models/ca/gstModel")
const Tax = require("../models/ca/taxModel")
const Audit = require("../models/ca/auditModel")
const Invoice = require("../models/common/invoiceModel")
const Client = require("../models/common/clientModel")

// ── Tera UserId ──
const USER_ID = "69fdb753af26457a93f5a6bd"

// ── Helper: Random item from array ──
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)]
const pickMany = (arr, n) => arr.slice(0, n)

// ── Clients Data ──
const clientsData = [
    { userId: USER_ID, name: "Rajesh Sharma", email: "rajesh@sharma.com", phone: "9876543210", type: "individual" },
    { userId: USER_ID, name: "Priya Enterprises", email: "priya@enterprises.com", phone: "9876543211", type: "company" },
    { userId: USER_ID, name: "Amit Verma", email: "amit@verma.com", phone: "9876543212", type: "individual" },
    { userId: USER_ID, name: "Suresh Trading Co.", email: "suresh@trading.com", phone: "9876543213", type: "company" },
    { userId: USER_ID, name: "Neha Gupta", email: "neha@gupta.com", phone: "9876543214", type: "individual" },
]

// ── Cases Data ──
const casesData = [
    {
        userId: USER_ID,
        caseNumber: "C-2024-001",
        caseTitle: "Sharma vs State of Delhi",
        court: "Delhi High Court",
        caseType: "criminal",
        status: "active",
        opposingParty: "State of Delhi",
        opposingLawyer: "Advocate R.K. Singh",
        fillingDate: new Date("2024-01-15"),
        hearings: [
            { date: new Date("2024-02-10"), notes: "First hearing, bail application filed", nextDate: new Date("2024-03-15") },
            { date: new Date("2024-03-15"), notes: "Bail granted", nextDate: new Date("2026-06-20") },
        ]
    },
    {
        userId: USER_ID,
        caseNumber: "C-2024-002",
        caseTitle: "Priya Enterprises vs Kumar Brothers",
        court: "District Court Delhi",
        caseType: "civil",
        status: "active",
        opposingParty: "Kumar Brothers Pvt Ltd",
        opposingLawyer: "Advocate M.L. Gupta",
        fillingDate: new Date("2024-02-20"),
        hearings: [
            { date: new Date("2024-03-25"), notes: "Summons issued", nextDate: new Date("2026-07-10") },
        ]
    },
    {
        userId: USER_ID,
        caseNumber: "C-2024-003",
        caseTitle: "Verma Family Property Dispute",
        court: "District Court Gurgaon",
        caseType: "civil",
        status: "adjourned",
        opposingParty: "Ramesh Verma",
        opposingLawyer: "Advocate S.K. Sharma",
        fillingDate: new Date("2023-11-10"),
        hearings: [
            { date: new Date("2024-01-20"), notes: "Documents submitted", nextDate: new Date("2026-08-05") },
            { date: new Date("2024-04-15"), notes: "Adjourned due to judge absence", nextDate: new Date("2026-09-10") },
        ]
    },
    {
        userId: USER_ID,
        caseNumber: "C-2023-015",
        caseTitle: "Suresh Trading Tax Dispute",
        court: "Income Tax Appellate Tribunal",
        caseType: "tax",
        status: "active",
        opposingParty: "Income Tax Department",
        opposingLawyer: "Government Advocate",
        fillingDate: new Date("2023-08-05"),
        hearings: [
            { date: new Date("2023-10-12"), notes: "Appeal filed", nextDate: new Date("2026-06-15") },
        ]
    },
    {
        userId: USER_ID,
        caseNumber: "C-2023-008",
        caseTitle: "Neha Gupta Divorce Case",
        court: "Family Court Delhi",
        caseType: "family",
        status: "settled",
        opposingParty: "Vikram Gupta",
        opposingLawyer: "Advocate P.K. Mehta",
        fillingDate: new Date("2023-05-18"),
        hearings: [
            { date: new Date("2023-07-22"), notes: "Mediation attempted", nextDate: new Date("2023-09-30") },
            { date: new Date("2023-09-30"), notes: "Settlement reached", nextDate: null },
        ]
    },
    {
        userId: USER_ID,
        caseNumber: "C-2024-007",
        caseTitle: "ABC Corp Trademark Infringement",
        court: "Delhi High Court",
        caseType: "corporate",
        status: "active",
        opposingParty: "XYZ Enterprises",
        opposingLawyer: "Advocate N.K. Joshi",
        fillingDate: new Date("2024-03-01"),
        hearings: [
            { date: new Date("2024-04-10"), notes: "Interim injunction granted", nextDate: new Date("2026-07-25") },
        ]
    },
    {
        userId: USER_ID,
        caseNumber: "C-2022-019",
        caseTitle: "State vs Mohan Lal",
        court: "Sessions Court Delhi",
        caseType: "criminal",
        status: "won",
        opposingParty: "State of Delhi",
        opposingLawyer: "Public Prosecutor",
        fillingDate: new Date("2022-09-14"),
        hearings: [
            { date: new Date("2022-11-20"), notes: "Trial started", nextDate: new Date("2023-02-15") },
            { date: new Date("2023-06-10"), notes: "Acquitted", nextDate: null },
        ]
    },
    {
        userId: USER_ID,
        caseNumber: "C-2024-010",
        caseTitle: "Patel vs Municipal Corporation",
        court: "High Court Mumbai",
        caseType: "civil",
        status: "active",
        opposingParty: "Municipal Corporation",
        opposingLawyer: "Corporation Lawyer",
        fillingDate: new Date("2024-04-05"),
        hearings: [
            { date: new Date("2024-05-15"), notes: "Notice issued to corporation", nextDate: new Date("2026-06-30") },
        ]
    },
    {
        userId: USER_ID,
        caseNumber: "C-2023-022",
        caseTitle: "Singh Brothers Partnership Dispute",
        court: "Commercial Court Delhi",
        caseType: "corporate",
        status: "closed",
        opposingParty: "Harjeet Singh",
        opposingLawyer: "Advocate K.L. Bhatia",
        fillingDate: new Date("2023-03-22"),
        hearings: [
            { date: new Date("2023-05-18"), notes: "Arbitration ordered", nextDate: new Date("2023-08-20") },
            { date: new Date("2023-10-05"), notes: "Award passed", nextDate: null },
        ]
    },
    {
        userId: USER_ID,
        caseNumber: "C-2024-012",
        caseTitle: "Consumer Complaint vs Big Mart",
        court: "Consumer Forum Delhi",
        caseType: "civil",
        status: "active",
        opposingParty: "Big Mart Retail Pvt Ltd",
        opposingLawyer: "Advocate R.S. Kapoor",
        fillingDate: new Date("2024-04-18"),
        hearings: [
            { date: new Date("2024-05-28"), notes: "Complaint admitted", nextDate: new Date("2026-07-15") },
        ]
    },
]

// ── Drafts Data ──
const draftsData = [
    {
        userId: USER_ID,
        title: "Legal Notice to Kumar Brothers",
        type: "notice",
        status: "final",
        isAIGenerated: false,
        content: "This is a legal notice served upon Kumar Brothers Pvt Ltd regarding breach of contract dated 01/01/2024. You are hereby directed to pay the outstanding amount of Rs. 5,00,000 within 15 days of receipt of this notice, failing which legal action will be initiated."
    },
    {
        userId: USER_ID,
        title: "Bail Application - Sharma vs State",
        type: "petition",
        status: "sent",
        isAIGenerated: true,
        content: "In the Hon'ble Delhi High Court. Bail Application on behalf of the accused Rajesh Sharma. The applicant has been falsely implicated and has strong roots in society..."
    },
    {
        userId: USER_ID,
        title: "Settlement Agreement - Neha Gupta",
        type: "agreement",
        status: "final",
        isAIGenerated: false,
        content: "This Settlement Agreement is entered into between Neha Gupta and Vikram Gupta. Both parties agree to the following terms and conditions for mutual separation..."
    },
    {
        userId: USER_ID,
        title: "Affidavit - Property Declaration",
        type: "affidavit",
        status: "draft",
        isAIGenerated: true,
        content: "I, Amit Verma, son of Ramesh Verma, resident of Delhi, do hereby solemnly affirm and declare that the property situated at..."
    },
    {
        userId: USER_ID,
        title: "Service Contract - ABC Corp",
        type: "contract",
        status: "draft",
        isAIGenerated: false,
        content: "This Service Agreement is made between ABC Corp and XYZ Services for providing legal consultation services for a period of one year..."
    },
]

// ── GST Filings Data ──
const gstData = [
    { userId: USER_ID, gstNumber: "07AABCS1429B1Z1", returnType: "GSTR-3B", period: "2024-03", status: "filed", totalTaxableValue: 500000, cgst: 45000, sgst: 45000, igst: 0, totalTax: 90000, filedAt: new Date("2024-04-20") },
    { userId: USER_ID, gstNumber: "07AABCS1429B1Z1", returnType: "GSTR-1", period: "2024-03", status: "filed", totalTaxableValue: 500000, cgst: 45000, sgst: 45000, igst: 0, totalTax: 90000, filedAt: new Date("2024-04-11") },
    { userId: USER_ID, gstNumber: "07AABCS1429B1Z1", returnType: "GSTR-3B", period: "2024-02", status: "filed", totalTaxableValue: 420000, cgst: 37800, sgst: 37800, igst: 0, totalTax: 75600, filedAt: new Date("2024-03-20") },
    { userId: USER_ID, gstNumber: "07AABCS1429B1Z1", returnType: "GSTR-1", period: "2024-02", status: "filed", totalTaxableValue: 420000, cgst: 37800, sgst: 37800, igst: 0, totalTax: 75600, filedAt: new Date("2024-03-11") },
    { userId: USER_ID, gstNumber: "07AABCS1429B1Z1", returnType: "GSTR-3B", period: "2024-01", status: "filed", totalTaxableValue: 380000, cgst: 34200, sgst: 34200, igst: 0, totalTax: 68400, filedAt: new Date("2024-02-20") },
    { userId: USER_ID, gstNumber: "07AABCS1429B1Z1", returnType: "GSTR-3B", period: "2024-04", status: "draft", totalTaxableValue: 550000, cgst: 49500, sgst: 49500, igst: 0, totalTax: 99000, filedAt: null },
    { userId: USER_ID, gstNumber: "07AABCS1429B1Z1", returnType: "GSTR-1", period: "2024-04", status: "draft", totalTaxableValue: 550000, cgst: 49500, sgst: 49500, igst: 0, totalTax: 99000, filedAt: null },
    { userId: USER_ID, gstNumber: "07AABCS1429B1Z1", returnType: "GSTR-9", period: "2023-03", status: "filed", totalTaxableValue: 4800000, cgst: 432000, sgst: 432000, igst: 0, totalTax: 864000, filedAt: new Date("2023-12-31") },
]

// ── Tax Filings Data ──
const taxData = [
    { userId: USER_ID, financialYear: "2023-24", itrType: "ITR-3", status: "filed", income: { salary: 0, business: 1200000, capitalGains: 150000, other: 50000 }, deductions: { section80C: 150000, section80D: 25000, hra: 0, other: 10000 }, taxPayable: 285000, taxPaid: 285000, acknowledgementNo: "123456789012345", filedAt: new Date("2024-07-25") },
    { userId: USER_ID, financialYear: "2022-23", itrType: "ITR-3", status: "acknowledged", income: { salary: 0, business: 980000, capitalGains: 80000, other: 40000 }, deductions: { section80C: 150000, section80D: 20000, hra: 0, other: 5000 }, taxPayable: 218000, taxPaid: 218000, acknowledgementNo: "987654321098765", filedAt: new Date("2023-07-20") },
    { userId: USER_ID, financialYear: "2021-22", itrType: "ITR-3", status: "acknowledged", income: { salary: 0, business: 750000, capitalGains: 0, other: 30000 }, deductions: { section80C: 150000, section80D: 18000, hra: 0, other: 0 }, taxPayable: 145000, taxPaid: 145000, acknowledgementNo: "456789012345678", filedAt: new Date("2022-07-28") },
    { userId: USER_ID, financialYear: "2024-25", itrType: "ITR-3", status: "draft", income: { salary: 0, business: 1500000, capitalGains: 200000, other: 75000 }, deductions: { section80C: 150000, section80D: 25000, hra: 0, other: 15000 }, taxPayable: 380000, taxPaid: 200000, acknowledgementNo: null, filedAt: null },
    { userId: USER_ID, financialYear: "2020-21", itrType: "ITR-2", status: "acknowledged", income: { salary: 600000, business: 0, capitalGains: 50000, other: 20000 }, deductions: { section80C: 120000, section80D: 15000, hra: 80000, other: 0 }, taxPayable: 95000, taxPaid: 95000, acknowledgementNo: "789012345678901", filedAt: new Date("2021-07-30") },
    { userId: USER_ID, financialYear: "2019-20", itrType: "ITR-1", status: "acknowledged", income: { salary: 480000, business: 0, capitalGains: 0, other: 15000 }, deductions: { section80C: 100000, section80D: 10000, hra: 60000, other: 0 }, taxPayable: 42000, taxPaid: 42000, acknowledgementNo: "234567890123456", filedAt: new Date("2020-08-10") },
]

// ── Audit Data ──
const auditData = [
    { userId: USER_ID, financialYear: "2023-24", auditType: "tax", status: "completed", observations: "No major discrepancies found. Minor issues in depreciation calculation rectified. Books of accounts maintained properly.", completedAt: new Date("2024-09-30") },
    { userId: USER_ID, financialYear: "2022-23", auditType: "internal", status: "completed", observations: "Internal controls found adequate. Recommendation: Implement digital payment tracking system.", completedAt: new Date("2023-08-15") },
    { userId: USER_ID, financialYear: "2024-25", auditType: "tax", status: "inprogress", observations: "Audit in progress. Documents under review.", completedAt: null },
    { userId: USER_ID, financialYear: "2024-25", auditType: "external", status: "draft", observations: "Scheduled for Q3 2024-25.", completedAt: null },
]

// ── Invoice Data ──
const invoicesData = [
    { userId: USER_ID, invoiceNumber: "INV-2024-001", subTotal: 50000, gst: 18, total: 59000, status: "paid", dueDate: new Date("2024-02-28"), items: [{ discription: "Legal consultation - January 2024", quantity: 1, amount: 50000 }] },
    { userId: USER_ID, invoiceNumber: "INV-2024-002", subTotal: 75000, gst: 18, total: 88500, status: "paid", dueDate: new Date("2024-03-31"), items: [{ discription: "Case representation - District Court", quantity: 1, amount: 75000 }] },
    { userId: USER_ID, invoiceNumber: "INV-2024-003", subTotal: 30000, gst: 18, total: 35400, status: "unpaid", dueDate: new Date("2024-05-15"), items: [{ discription: "GST filing services - Q4 2023-24", quantity: 1, amount: 30000 }] },
    { userId: USER_ID, invoiceNumber: "INV-2024-004", subTotal: 120000, gst: 18, total: 141600, status: "paid", dueDate: new Date("2024-04-30"), items: [{ discription: "ITR filing and tax planning", quantity: 1, amount: 120000 }] },
    { userId: USER_ID, invoiceNumber: "INV-2024-005", subTotal: 45000, gst: 18, total: 53100, status: "unpaid", dueDate: new Date("2024-06-30"), items: [{ discription: "Draft preparation - Settlement Agreement", quantity: 1, amount: 45000 }] },
    { userId: USER_ID, invoiceNumber: "INV-2024-006", subTotal: 25000, gst: 18, total: 29500, status: "overdue", dueDate: new Date("2024-03-15"), items: [{ discription: "Legal notice drafting", quantity: 1, amount: 25000 }] },
    { userId: USER_ID, invoiceNumber: "INV-2024-007", subTotal: 80000, gst: 18, total: 94400, status: "paid", dueDate: new Date("2024-05-31"), items: [{ discription: "High Court representation", quantity: 1, amount: 80000 }] },
    { userId: USER_ID, invoiceNumber: "INV-2023-045", subTotal: 60000, gst: 18, total: 70800, status: "paid", dueDate: new Date("2023-12-31"), items: [{ discription: "Annual tax audit assistance", quantity: 1, amount: 60000 }] },
    { userId: USER_ID, invoiceNumber: "INV-2024-008", subTotal: 35000, gst: 18, total: 41300, status: "unpaid", dueDate: new Date("2024-07-15"), items: [{ discription: "Trademark registration assistance", quantity: 1, amount: 35000 }] },
    { userId: USER_ID, invoiceNumber: "INV-2024-009", subTotal: 90000, gst: 18, total: 106200, status: "paid", dueDate: new Date("2024-06-15"), items: [{ discription: "Corporate legal advisory - Q1 2024", quantity: 1, amount: 90000 }] },
]

// ── Main Seed Function ──
const seedData = async () => {
    try {
        console.log("MongoDB connecting...")
        await mongoose.connect(process.env.MONGODB_URI)
        console.log("MongoDB connected!")

        // Pehle purana data delete karo (is user ka)
        console.log("\nPurana data delete kar raha hoon...")
        await Case.deleteMany({ userId: USER_ID })
        await Draft.deleteMany({ userId: USER_ID })
        await Gst.deleteMany({ userId: USER_ID })
        await Tax.deleteMany({ userId: USER_ID })
        await Audit.deleteMany({ userId: USER_ID })
        await Invoice.deleteMany({ userId: USER_ID })
        console.log("Purana data delete ho gaya!")

        // Naya data insert karo
        console.log("\nNaya data insert kar raha hoon...")

        const cases = await Case.insertMany(casesData)
        console.log(`✅ ${cases.length} Cases created`)

        // Drafts mein caseId add karo
        draftsData[0].caseId = cases[1]._id  // Priya Enterprises case
        draftsData[1].caseId = cases[0]._id  // Sharma vs State
        draftsData[2].caseId = cases[4]._id  // Neha Gupta case
        const drafts = await Draft.insertMany(draftsData)
        console.log(`✅ ${drafts.length} Drafts created`)

        const gsts = await Gst.insertMany(gstData)
        console.log(`✅ ${gsts.length} GST Filings created`)

        const taxes = await Tax.insertMany(taxData)
        console.log(`✅ ${taxes.length} Tax Filings created`)

        const audits = await Audit.insertMany(auditData)
        console.log(`✅ ${audits.length} Audits created`)

        const invoices = await Invoice.insertMany(invoicesData)
        console.log(`✅ ${invoices.length} Invoices created`)

        console.log("\n🎉 Seed data successfully created!")
        console.log("\nAb ye queries test karo:")
        console.log('  → "mere active cases dikhao"')
        console.log('  → "GST filing status dikhao"')
        console.log('  → "pending invoices dikhao"')
        console.log('  → "2023-24 ka ITR status kya hai?"')
        console.log('  → "tax audit status batao"')

    } catch (err) {
        console.error("Seed failed:", err.message)
    } finally {
        await mongoose.disconnect()
        console.log("\nMongoDB disconnected!")
    }
}

seedData()