const PDFDocument = require("pdfkit");

// ── DESIGN CONSTANTS ─────────────────────────────────────────────
// All colors defined in one place
// Easy to change the entire theme by editing here
const COLORS = {
  // Header
  headerBg: "#1a365d", // dark navy blue
  headerText: "#ffffff", // white
  headerSubText: "#90cdf4", // light blue

  // Sections
  memberSection: "#2b6cb0", // medium blue
  bookingSection: "#276749", // dark green
  sectionText: "#ffffff", // white text on section headers

  // Rows
  rowAlt: "#f7fafc", // very light gray (alternating rows)
  rowNormal: "#ffffff", // white

  // Labels and values
  labelColor: "#718096", // gray
  valueColor: "#1a202c", // near black

  // Amount box
  amountBg: "#f0fff4", // very light green
  amountBorder: "#9ae6b4", // light green border
  amountText: "#276749", // dark green

  // Status badge
  paidBadgeBg: "#276749", // dark green
  paidBadgeText: "#ffffff", // white

  // Meta bar (receipt number bar)
  metaBarBg: "#ebf8ff", // very light blue

  // Footer
  footerBg: "#f7fafc", // very light gray
  footerText: "#a0aec0", // light gray text

  // Borders
  border: "#e2e8f0", // light border

  // Accent
  accent: "#2b6cb0", // blue accent
};

// Page dimensions (A4 in points)
const PAGE = {
  width: 595.28,
  height: 841.89,
  margin: 40,
};

// Content width = page - left margin - right margin
const CONTENT_WIDTH = PAGE.width - PAGE.margin * 2;

// ── MAIN FUNCTION ─────────────────────────────────────────────────
const generateReceipt = (res, data) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: "A4",
        margin: 0, // We handle margins manually for full control
      });

      // Tell browser this is a PDF
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename=receipt-${data.receiptNumber}.pdf`,
      );

      // Connect PDF to response
      doc.pipe(res);

      // ── 1. HEADER SECTION ────────────────────────────────────
      // Full-width dark blue background
      doc.rect(0, 0, PAGE.width, 115).fill(COLORS.headerBg);

      // Library name — large and centered
      doc
        .fillColor(COLORS.headerText)
        .fontSize(26)
        .font("Helvetica-Bold")
        .text(data.libraryName, PAGE.margin, 22, {
          width: CONTENT_WIDTH,
          align: "center",
        });

      // Library address — smaller, light blue
      doc
        .fillColor(COLORS.headerSubText)
        .fontSize(9)
        .font("Helvetica")
        .text(data.libraryAddress, PAGE.margin, 56, {
          width: CONTENT_WIDTH,
          align: "center",
        });

      // Library phone
      doc
        .fillColor(COLORS.headerSubText)
        .fontSize(9)
        .text(`Phone: ${data.libraryPhone}`, PAGE.margin, 72, {
          width: CONTENT_WIDTH,
          align: "center",
        });

      // "PAYMENT RECEIPT" label — top right corner of header
      // Small yellow badge
      doc.rect(PAGE.width - PAGE.margin - 115, 18, 115, 22).fill("#d69e2e");

      doc
        .fillColor("#fffff0")
        .fontSize(9)
        .font("Helvetica-Bold")
        .text("PAYMENT RECEIPT", PAGE.width - PAGE.margin - 115, 24, {
          width: 115,
          align: "center",
        });

      // ── 2. META BAR — Receipt number + Date ──────────────────
      doc.rect(0, 115, PAGE.width, 42).fill(COLORS.metaBarBg);

      // Left: Receipt number
      doc
        .fillColor(COLORS.accent)
        .fontSize(10)
        .font("Helvetica-Bold")
        .text(`Receipt No:  #${data.receiptNumber}`, PAGE.margin, 127);

      // Right: Date
      const formattedDate = new Date(data.paidAt).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      });

      doc
        .fillColor(COLORS.valueColor)
        .fontSize(10)
        .font("Helvetica")
        .text(formattedDate, 0, 127, {
          width: PAGE.width - PAGE.margin,
          align: "right",
        });

      // Below: payment mode
      doc
        .fillColor(COLORS.labelColor)
        .fontSize(8.5)
        .text(
          `Payment Mode: ${
            data.paymentMode === "cash" ? "Cash" : "Online (Razorpay)"
          }`,
          PAGE.margin,
          142,
        );

      // Transaction ID if online payment
      if (data.razorpayPaymentId) {
        doc
          .fillColor(COLORS.labelColor)
          .fontSize(8.5)
          .text(
            `Transaction ID: ${data.razorpayPaymentId}`,
            PAGE.margin + 200,
            142,
          );
      }

      // Track current Y position
      // Everything below is positioned relative to this
      let y = 175;

      // ── HELPER FUNCTIONS ──────────────────────────────────────

      // Draws a colored section header bar
      // Returns Y position after the bar
      const drawSectionHeader = (title, color, currentY) => {
        doc.rect(PAGE.margin, currentY, CONTENT_WIDTH, 26).fill(color);

        doc
          .fillColor(COLORS.sectionText)
          .fontSize(10)
          .font("Helvetica-Bold")
          .text(title, PAGE.margin + 12, currentY + 8);

        return currentY + 26;
      };

      // Draws one row of label + value
      // isAlt = alternating background (light gray)
      const drawRow = (label, value, currentY, isAlt = false) => {
        const rowHeight = 24;

        // Alternating background
        doc
          .rect(PAGE.margin, currentY, CONTENT_WIDTH, rowHeight)
          .fill(isAlt ? COLORS.rowAlt : COLORS.rowNormal);

        // Label (gray)
        doc
          .fillColor(COLORS.labelColor)
          .fontSize(9)
          .font("Helvetica")
          .text(label, PAGE.margin + 12, currentY + 7);

        // Value (dark, bold)
        doc
          .fillColor(COLORS.valueColor)
          .fontSize(9)
          .font("Helvetica-Bold")
          .text(String(value || "N/A"), PAGE.margin + 175, currentY + 7, {
            width: CONTENT_WIDTH - 185,
          });

        return currentY + rowHeight;
      };

      // ── 3. MEMBER DETAILS SECTION ─────────────────────────────
      y = drawSectionHeader("  MEMBER DETAILS", COLORS.memberSection, y);

      // White background for rows
      doc
        .rect(PAGE.margin, y, CONTENT_WIDTH, 96)
        .fill(COLORS.rowNormal)
        .stroke(COLORS.border);

      y = drawRow("Full Name", data.studentName, y);
      y = drawRow("Membership ID", data.membershipId, y, true);
      y = drawRow("Phone", data.studentPhone, y);
      y = drawRow("Email", data.studentEmail, y, true);

      y += 14; // Gap between sections

      // ── 4. BOOKING DETAILS SECTION ────────────────────────────
      y = drawSectionHeader("  BOOKING DETAILS", COLORS.bookingSection, y);

      doc
        .rect(PAGE.margin, y, CONTENT_WIDTH, 144)
        .fill(COLORS.rowNormal)
        .stroke(COLORS.border);

      y = drawRow("Seat Label", data.seatLabel, y);
      y = drawRow("Seat Type", data.seatType.toUpperCase(), y, true);
      y = drawRow("Time Slot", data.slotName, y);
      y = drawRow("Slot Timing", data.slotTime, y, true);
      y = drawRow(
        "Valid From",
        new Date(data.startDate).toLocaleDateString("en-IN", {
          day: "2-digit",
          month: "long",
          year: "numeric",
        }),
        y,
      );
      y = drawRow(
        "Valid Until",
        new Date(data.endDate).toLocaleDateString("en-IN", {
          day: "2-digit",
          month: "long",
          year: "numeric",
        }),
        y,
        true,
      );

      y += 20; // Gap before amount box

      // ── 5. AMOUNT BOX ─────────────────────────────────────────
      // Big green box — most important part of receipt
      const amountBoxHeight = 80;

      doc
        .rect(PAGE.margin, y, CONTENT_WIDTH, amountBoxHeight)
        .fillAndStroke(COLORS.amountBg, COLORS.amountBorder);

      // "PAID" status badge — top right inside box
      doc
        .rect(PAGE.width - PAGE.margin - 70, y + 12, 65, 22)
        .fill(COLORS.paidBadgeBg);

      doc
        .fillColor(COLORS.paidBadgeText)
        .fontSize(10)
        .font("Helvetica-Bold")
        .text("PAID", PAGE.width - PAGE.margin - 70, y + 18, {
          width: 65,
          align: "center",
        });

      // Amount — big and prominent
      // Using "INR" instead of "₹" because Helvetica doesn't support ₹
      // INR is universally understood and looks professional
      doc
        .fillColor(COLORS.amountText)
        .fontSize(32)
        .font("Helvetica-Bold")
        .text(`INR ${data.amount}`, PAGE.margin + 16, y + 14, {
          width: CONTENT_WIDTH - 90,
        });

      // "Total Amount Paid" label below amount
      doc
        .fillColor(COLORS.labelColor)
        .fontSize(9)
        .font("Helvetica")
        .text("Total Amount Paid", PAGE.margin + 18, y + 54);

      y += amountBoxHeight + 16;

      // ── 6. THIN DIVIDER LINE ─────────────────────────────────
      doc
        .moveTo(PAGE.margin, y)
        .lineTo(PAGE.width - PAGE.margin, y)
        .strokeColor(COLORS.border)
        .lineWidth(0.5)
        .stroke();

      y += 12;

      // ── 7. NOTE BOX ───────────────────────────────────────────
      // Small info box with light blue background
      doc.rect(PAGE.margin, y, CONTENT_WIDTH, 36).fill("#bee3f8");

      doc
        .fillColor("#2c5282")
        .fontSize(8.5)
        .font("Helvetica")
        .text(
          "Note: This is a computer generated receipt. Please keep it safe for future reference.",
          PAGE.margin + 10,
          y + 6,
          { width: CONTENT_WIDTH - 20 },
        );

      doc
        .fillColor("#2c5282")
        .fontSize(8.5)
        .text(
          "For any payment related queries, please visit the library or contact us.",
          PAGE.margin + 10,
          y + 20,
          { width: CONTENT_WIDTH - 20 },
        );

      // ── 8. FOOTER ─────────────────────────────────────────────
      // Positioned at bottom of page regardless of content height
      const footerY = PAGE.height - 55;

      doc.rect(0, footerY, PAGE.width, 55).fill(COLORS.footerBg);

      // Thin line above footer
      doc
        .moveTo(0, footerY)
        .lineTo(PAGE.width, footerY)
        .strokeColor(COLORS.border)
        .lineWidth(1)
        .stroke();

      doc
        .fillColor(COLORS.footerText)
        .fontSize(8.5)
        .font("Helvetica")
        .text(
          `Thank you for being a valued member of ${data.libraryName}`,
          PAGE.margin,
          footerY + 10,
          { width: CONTENT_WIDTH, align: "center" },
        );

      doc
        .fillColor(COLORS.border)
        .fontSize(7.5)
        .text(
          `Generated on: ${new Date().toLocaleString("en-IN")}`,
          PAGE.margin,
          footerY + 28,
          { width: CONTENT_WIDTH, align: "center" },
        );

      doc
        .fillColor(COLORS.border)
        .fontSize(7.5)
        .text(
          `${data.libraryName} | ${data.libraryPhone}`,
          PAGE.margin,
          footerY + 40,
          { width: CONTENT_WIDTH, align: "center" },
        );

      // ── FINISH ────────────────────────────────────────────────
      doc.end();
      doc.on("end", resolve);
      doc.on("error", reject);
    } catch (err) {
      reject(err);
    }
  });
};

module.exports = generateReceipt;
