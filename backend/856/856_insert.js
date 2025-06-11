// This module handles the insertion of parsed EDI 856 records into the PostgreSQL database. 
// It exports functions to insert header, detail, measure, and names records into their respective tables.

function getLocNumber(plantID) {


return null;
}


function findGaugeType(fortynine) {
  // First search
  const found = fortynine.find(
    m =>
      ["GG", "TH"].includes(m["Measurement Qualifier"]) &&
      ["ED", "MB"].includes(m["Measurement UOM"])
  );
  if (found) return 'NOM';

  // Second search (example: change the logic as needed)
  const alt = fortynine.find(
    m =>
      ["GG", "TH"].includes(m["Measurement Qualifier"]) &&
      ["EM", "MZ"].includes(m["Measurement UOM"])
  );
  if (alt) return 'MIN'; // or return alt, or whatever you want

  // If nothing found
  return null;
}

function getXref(CT, five, ten, eleven) {
  const ManufactuerID = ten["Manufacturer ID"] || eleven[0]["AddressTypeCode"] === 'MF' ? eleven[0]["Name"] : '';
  const OwnerID = ten["Owner's ID"] || eleven[0]["AddressTypeCode"] === 'OW' ? eleven[0]["Name"] : '';
  const ShipFrom = ten["Ship From ID"] || eleven[0]["AddressTypeCode"] === 'SF' ? eleven[0]["Name"] : '';
  const ShipTo = ten["Ship To ID"] || eleven[0]["AddressTypeCode"] === 'ST' ? eleven[0]["Name"] : '';
  const ISAsenderID = CT["ISA Sender ID"] || '';


  return null
}















async function insert856Header(pool, CT, five, ten, twelve, fourteen, eighty, eleven) {
  try {

    // Get XREF and LocNumber from outside tables
    const Xref = getXref(CT, five, ten, eleven)
    const LocNo = getLocNumber(CT["Plant ID Code"]);

    await pool.query(`
     INSERT INTO public."856Header"(
      hdr_type, hdr_key, hdr_isa_qual, hdr_isnd_id, hdr_gsnd_id, hdr_ircv_id, hdr_grcv_id, hdr_ictl_no, hdr_func_no, hdr_gctl_no, hdr_ircv_qual, hdr_stctl_no, hdr_bsn_cd, hdr_bsn_no, hdr_bsn_dte, hdr_bsn_tme, hdr_tran_typ, hdr_shp_dte, hdr_shp_tme, hdr_shp_tzn, hdr_bol_no, hdr_mbol_no, hdr_pck_no, hdr_dck_cd, hdr_shp_grss_wgt_lb, hdr_shp_grss_wgt_kg, hdr_shp_grss_wgt_uom, hdr_shp_net_wgt_lb, hdr_shp_net_wgt_kg, hdr_shp_net_wgt_uom, hdr_shp_ttl_pc_cnt, hdr_shp_itm_typ, hdr_shp_itm_cnt, hdr_rte_sq_cd, hdr_std_car_cd, hdr_tspt_mthd, hdr_tspt_rt_name, hdr_shp_ord_sts, hdr_shp_loc_id, hdr_eq_cd, hdr_eq_init, hdr_eq_nbr, hdr_shp_mthd_pmnt, hdr_sf_no, hdr_st_no, hdr_shp_hl, hdr_shp_phl, hdr_shp_hl_cd, hdr_shp_hl_ccd, hdr_swgt_typ, hdr_swgt, hdr_swgt_uom, hdr_sum_hl_seg, hdr_sum_hsh_ttl, hdr_sttx_locn, hdr_crt_dat, hdr_crt_tim, hdr_crt_pgm, hdr_xref
    )
    VALUES (
      $1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
      $11, $12, $13, $14, $15, $16, $17, $18, $19, $20,
      $21, $22, $23, $24, $25, $26, $27, $28, $29, $30,
      $31, $32, $33, $34, $35, $36, $37, $38, $39, $40,
      $41, $42, $43, $44, $45, $46, $47, $48, $49, $50,
      $51, $52, $53, $54, $55, $56, $57, $58, $59)
    `, [
      // 1-2: character, numeric
      CT["Type (T=Toll; M=Margin; D=Direct Ship)"],
      parseInt(CT["Record Key (10-digit integer)"]),
      // 3-7: character
      CT["ISA Sender ID Qualifier"],
      CT["ISA Sender ID"],
      CT["GS Sender ID"],
      CT["ISA Receiver ID"],
      CT["GS Receiver ID"],
      // 8-10: character
      CT["ISA Control Number"],
      CT["GS Functional Group ID"],
      CT["GS Control Number"],
      // 11-12: character
      CT["ISA Receiver ID Qualifier"],
      CT["ST Control Number"],
      // 13-14: character
      five["Purpose Code"],
      five["ASN Number"],
      // 15: numeric
      parseInt(five["ASN Date"]),
      // 16: numeric
      parseInt(five["ASN Time"]),
      // 17: character
      five["Transaction Type"],
      // 18: numeric
      parseInt(five["Shipment Date"]),
      // 19: numeric
      parseInt(five["Shipment Time"]),
      // 20: character
      five["Shipment Time Zone"],
      // 21-23: character
      ten["Bill of Lading"],
      ten["Mst Bill Lading"],
      ten["Packing Slip"],
      // 24: character
      ten["Dock Code"],
      // 25: numeric
      parseFloat(ten["Gross Weight (LB)"]),
      // 26: numeric
      parseFloat(ten["Gross Weight (KG)"]),
      // 27: character
      ten["Gross Wt UM"],
      // 28: numeric
      parseInt(ten["Net Weight (LB)"]),
      // 29: numeric
      parseFloat(ten["Net Weight (KG)"]),
      // 30: character
      ten["Net Wt UM"],
      // 31: numeric
      parseInt(ten["Total Piece Count"]),
      // 32: character
      twelve["Container Type"],
      // 33: numeric
      parseInt(twelve["Number of Containers"]),
      // 34: character
      fourteen["Route Seq Code"],
      // 35: character
      fourteen["SCAC Code"],
      // 36: character
      fourteen["Transport Method"],
      // 37: character
      fourteen["Transport Route"],
      // 38: character
      fourteen["Shipment/Order Status Code"],
      // 39: character
      fourteen["Ship Location ID"],
      // 40: character
      ten["Equipment Code"],
      // 41: character
      ten["Equip SCAC Code"],
      // 42: character
      ten["Conveyance No"],
      // 43: character
      ten["Payment Method"],
      // 44: character
      ten["Ship From ID"],
      // 45: character
      ten["Ship To ID"],
      // 46: character
      ten["Ship HL ID"],
      // 47: character
      ten["HL Parent ID"],
      // 48: character
      ten["HL Level Code"],
      // 49: character
      ten["HL Child Code"],
      // 50: character
      twelve["Weight Qual"],
      // 51: numeric
      parseFloat(twelve["Weight"]),
      // 52: character
      twelve["Weight Uom"],
      // 53: numeric
      parseInt(eighty["No HL or LIN"]),
      // 54: numeric
      parseInt(eighty["Total Line Qtys"]),
      // 55: character
      LocNo ? LocNo : null,
      // 56: numeric
      parseInt(new Date().toISOString().replace(/\D/g, '').slice(0, 8)), // or your preferred numeric date
      // 57: numeric
      parseInt(new Date().toISOString().replace(/\D/g, '').slice(8, 14)), // or your preferred numeric time
      // 58: character
      "856i.js",
      // 59: numeric
      Xref ? Xref : null
    ]);

    console.log('856 Header inserted successfully');
  } catch (error) {
    console.error('Error inserting parsed records:', error);
  }
};

  //856 Names Insert
async function insert856Names(pool, CT, eleven) {
 try {
    await pool.query( `INSERT INTO public."856Names"(
	name_hdr_typ, name_hrd_key, name_qual, name_qual_id, name_id, name_name, name_addr1, name_addr2, name_city, name_state, name_zpcd, name_ctry_cd, name_cont_name, name_cont_phn, name_cont_eml, name_crt_dte, name_crt_tme, name_crt_pgm)
	VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18);`,
  [
    CT["Type (T=Toll; M=Margin; D=Direct Ship)"], 
    CT["Record Key (10-digit integer)"],
    eleven[0]["AddressTypeCode"], 
    eleven[0]["Address ID Qualifier"],
    eleven[0]["AddressNo"],
    eleven[0]["Name"],
    eleven[0]["Line1"],
    eleven[0]["Line2"],
    eleven[0]["State"],
    eleven[0]["ZipCode"],
    eleven[0]["CountryCode"],
    eleven[0]["ContactName"],
    eleven[0]["ContactPhone"],
    eleven[0]["ContactEmail"],
    eleven[0]["CreationDate"],
    eleven[0]["CreationTime"],
    eleven[0]["CreationProgram"],
    eleven[0]["CreationUser"]
  ]);


    console.log('856 Names inserted successfully');
  } catch (error) {
    console.error('Error inserting parsed records:', error);
  }
}


async function insert856Detail(pool, CT, five, ten, thirty, forty, fortynine, eleven) {
 try {
  // Get XREF and LocNumber from outside tables
  const Xref = getXref(CT, five, ten, eleven)
  const LocNo = getLocNumber(CT["Plant ID Code"]);

  // Extract measurements logic from fortynine
  const WeightLB = fortynine.find(m => ["LB", "01"].includes(m["Measurement UOM"]) && m["Measurement Qualifier"] === "WT");
  const WeightKG = fortynine.find(m => ["KG", "50"].includes(m["Measurement UOM"]) && m["Measurement Qualifier"] === "WT");
  const WeightTLB = fortynine.find(m => m["Measurement UOM"] === "24" && m["Measurement Qualifier"] === "WT");
  const WeightTKG = fortynine.find(m => m["Measurement UOM"] === "53" && m["Measurement Qualifier"] === "WT");
  const GaugeType = findGaugeType(fortynine);
  const GaugeIN = fortynine.find(m => ["GG", "TH"].includes(m["Measurement Qualifier"]) && ["IN", "ED", "EM", "E8"].includes(m["Measurement UOM"]));
  const GaugeMM = fortynine.find(m => ["GG", "TH"].includes(m["Measurement Qualifier"]) && ["MM", "MB", "MZ", "M2"].includes(m["Measurement UOM"]));
  const WidthIN = fortynine.find(m => m["Measurement Qualifier"] === "WD" && ["IN", "ED", "EM", "E8"].includes(m["Measurement UOM"]));
  const WidthMM = fortynine.find(m => m["Measurement Qualifier"] === "WD" && ["MM", "MB", "MZ", "M2"].includes(m["Measurement UOM"]));
  const UnitLengthIN = fortynine.find(m => m["Measurement Qualifier"] === "LN" && ["IN", "ED", "EM", "E8"].includes(m["Measurement UOM"]));
  const UnitLengthMM = fortynine.find(m => m["Measurement Qualifier"] === "LN" && ["MM", "MB", "MZ", "M2"].includes(m["Measurement UOM"]));
  const LinearFT = fortynine.find(m => m["Measurement Qualifier"] === "LN" && ["FT", "LF"].includes(m["Measurement UOM"]));
  const LinearMT = fortynine.find(m => m["Measurement Qualifier"] === "LN" && ["MT", "LM"].includes(m["Measurement UOM"]));
  const InsideDiameterIN = fortynine.find(m => m["Measurement Qualifier"] === "ID" && ["IN", "ED", "EM", "E8"].includes(m["Measurement UOM"]));
  const InsideDiameterMM = fortynine.find(m => m["Measurement Qualifier"] === "ID" && ["MM", "MB", "MZ", "M2"].includes(m["Measurement UOM"]));
  const OutsideDiameterIN = fortynine.find(m => m["Measurement Qualifier"] === "OD" && ["IN", "ED", "EM", "E8"].includes(m["Measurement UOM"]));
  const OutsideDiameterMM = fortynine.find(m => m["Measurement Qualifier"] === "OD" && ["MM", "MB", "MZ", "M2"].includes(m["Measurement UOM"]));
    //856 Detail Insert

  console.log(GaugeIN ? GaugeIN["Measurement Value"] : "No GaugeIN found");
    await pool.query(`INSERT INTO public."856Detail"(
	dtl_type, dtl_key, dtl_hl1, dtl_hl2, dtl_hl3, dtl_hl4, dtl_bsn2, dtl_bol, dtl_heat, dtl_mcoil, dtl_prev, dtl_mo, dtl_mol, dtl_cpo, dtl_cpor, dtl_cpoc, dtl_cpod, dtl_cpol, dtl_ucpo, dtl_po, dtl_poc, dtl_pod, dtl_pol, dtl_rls, dtl_cpart, dtl_awgtlb, dtl_awgtkg, dtl_twgtlb, dtl_twgtkg, dtl_gaugin, dtl_gaugmm, dtl_gaugt, dtl_widin, dtl_widmm, dtl_ulenin, dtl_ulenmm, dtl_lnft, dtl_lnmt, dtl_idin, dtl_idmm, dtl_odin, dtl_odmm, dtl_pcs, dtl_qtyuom, dtl_grcd, dtl_mcls67, dtl_msts68, dtl_msts70, dtl_edge22, dtl_msa, dtl_n1sf, dtl_n1st, dtl_n1ma, dtl_ohl1, dtl_ohl2, dtl_ohl3, dtl_ohl4, dtl_shp, dtl_ouom, dtl_cqty, dtl_locn, dtl_odat, dtl_otim, dtl_opgm, dtl_apart, dtl_partd, dtl_mdat, dtl_osid, dtl_cshdt, dtl_lubdt, dtl_bhdt, dtl_xref, dtl_sttxpo, dtl_ccoil, dtl_tmpr, dtl_olin01, dtl_ilin01, dtl_corg, dtl_smelt1, dtl_smelt2)
	VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29, $30, $31, $32, $33, $34, $35, $36, $37, $38, $39, $40, $41, $42, $43, $44, $45, $46, $47, $48, $49, $50, $51, $52, $53, $54, $55, $56, $57, $58, $59, $60, $61, $62, $63, $64, $65, $66, $67, $68, $69, $70, $71, $72, $73, $74, $75, $76, $77, $78, $79, $80)`,
[
    CT["Type (T=Toll; M=Margin; D=Direct Ship)"], 
    CT["Record Key (10-digit integer)"], 
    forty[0]["Item HL ID"], 
    forty[0]["HL Parent ID"],
    forty[0]["HL Level Code"],
    forty[0]["HL Child Code"],
    five["ASN Number"],
    ten["Bill of Lading"],
    forty[0]["Heat Number"],
    forty[0]["Mill Coil Number"],
    forty[0]["Previous/Processor Tag Nbr"],
    forty[0]["Item Mill Order Number"] ? forty[0]["Item Mill Order Number"] : thirty[0]["Mill Order Number"],
    thirty[0]["Mill Order Line"],
    thirty[0]["PO No"],
    thirty[0]["Customer PO Release Number"],
    thirty[0]["Change Order Sequence Number"],
    thirty[0]["PO Date"] ? thirty[0]["PO Date"] : null,
    thirty[0]["Customer PO Line Number"],
    thirty[0]["Ultimate Customer PO Number"],
    forty[0]["PO No"],
    forty[0]["Change Order Sequence Number"],
    forty[0]["PO Date"] ? forty[0]["PO Date"] : null,
    forty[0]["PO Line No"],
    forty[0]["Release No"] ? forty[0]["Release No"] : thirty[0]["Release No"],
    forty[0]["Part Number5"] ? forty[0]["Part Number5"] : thirty[0]["Customer Part No"],
    WeightLB ? WeightLB["Measurement Value"] : WeightTKG ? WeightKG["Measurement Value"] * 2.20462 : null,
    WeightKG ? WeightKG["Measurement Value"] : WeightLB ? WeightLB["Measurement Value"] / 2.20462 : null,
    WeightTLB ? WeightTLB["Measurement Value"] : WeightTKG ? WeightTKG["Measurement Value"] * 2.20462 : null,
    WeightTKG ? WeightTKG["Measurement Value"] : WeightTLB ? WeightTLB["Measurement Value"] / 2.20462 : null,
    GaugeIN ? GaugeIN["Measurement Value"] : GaugeMM ? GaugeMM["Measurement Value"] / 25.4 : null,
    GaugeMM ? GaugeMM["Measurement Value"] : GaugeIN ? GaugeIN["Measurement Value"] * 25.4 : null,
    GaugeType,
    WidthIN ? WidthIN["Measurement Value"] : WidthMM ? WidthMM["Measurement Value"] / 25.4 : null,
    WidthMM ? WidthMM["Measurement Value"] : WidthIN ? WidthIN["Measurement Value"] * 25.4 : null,
    UnitLengthIN ? UnitLengthIN["Measurement Value"] : UnitLengthMM ? UnitLengthMM["Measurement Value"] / 25.4 : null,
    UnitLengthMM ? UnitLengthMM["Measurement Value"] : UnitLengthIN ? UnitLengthIN["Measurement Value"] * 25.4 : null,
    LinearFT ? LinearFT["Measurement Value"] : LinearMT ? LinearMT["Measurement Value"] / .3048 : null,
    LinearMT ? LinearMT["Measurement Value"] : LinearFT ? LinearFT["Measurement Value"] * .3048 : null,
    InsideDiameterIN ? InsideDiameterIN["Measurement Value"] : InsideDiameterMM ? InsideDiameterMM["Measurement Value"] / 25.4 : null,
    InsideDiameterMM ? InsideDiameterMM["Measurement Value"] : InsideDiameterIN ? InsideDiameterIN["Measurement Value"] * 25.4 : null,
    OutsideDiameterIN ? OutsideDiameterIN["Measurement Value"] : OutsideDiameterMM ? OutsideDiameterMM["Measurement Value"] / 25.4 : null,
    OutsideDiameterMM ? OutsideDiameterMM["Measurement Value"] : OutsideDiameterIN ? OutsideDiameterIN["Measurement Value"] * 25.4 : null,
    forty[0]["Net Qty Ship"],
    forty[0]["Qty UOM"],
    forty[0]["Grade Code"],
    forty[0]["Material Classification (AISI table 67)"],
    forty[0]["Material Status - QA (AISI table 68)"],
    forty[0]["Material Status (AISI table 70)"],
    forty[0]["Edge Designation (AISI table 22)"],
    forty[0]["Matl Specification Application Nbr"],
    ten["Ship From ID"],
    ten["Ship To ID"],
    thirty[0]["Final Dest"],
    thirty[0]["Order HL ID"],
    thirty[0]["HL Parent ID"],
    thirty[0]["HL Level Code"],
    thirty[0]["HL Child Code"],
    thirty[0]["Net Qty Shipped"] ? thirty[0]["Net Qty Shipped"] : null,
    thirty[0]["Qty UOM"] ? thirty[0]["Qty UOM"] : null,
    thirty[0]["Cum Qty Shipped"] ? thirty[0]["Cum Qty Shipped"] : null,
    LocNo ? LocNo : null,
      parseInt(new Date().toISOString().replace(/\D/g, '').slice(0, 8)), // or your preferred numeric date
      parseInt(new Date().toISOString().replace(/\D/g, '').slice(8, 14)), // or your preferred numeric time
    "856insert.js",
    thirty[0]["Alt Part No"],
    thirty[0]["Part Description (Shop)"],
    forty[0]["Mill Create Date"] ? forty[0]["Mill Create Date"] : null,
    forty[0]["Original Shipper's BOL Nbr"],
    forty[0]["Heat Treat (Cash) Date"] ? forty[0]["Heat Treat (Cash) Date"] : null,
    forty[0]["Lube Application Date"] ? forty[0]["Lube Application Date"] : null,
    forty[0]["Bake Hardening Date"] ? forty[0]["Bake Hardening Date"] : null,
    Xref ? Xref : null,
    12345,
    forty[0]["Consumed Coil ID"],
    forty[0]["Temper"],
    thirty[0]["Line Item No"],
    forty[0]["Line No"],
    forty[0]["Country of origin (cast)"] ? forty[0]["Country of origin (cast)"] : thirty[0]["Country of origin (cast)"],
    forty[0]["Primary Country of Smelt"] ? forty[0]["Primary Country of Smelt"] : thirty[0]["Primary Country of Smelt"],
    forty[0]["Secondary Country of Smelt"] ? forty[0]["Secondary Country of Smelt"] : thirty[0]["Secondary Country of Smelt"]

])
//console.log('856 Detail inserted successfully');
  } catch (error) {
    console.error('Error inserting parsed records:', error);
  }}




//856 Measure Insert
async function insert856Measure(pool, CT, forty, five, ten, fortynine, thirty, eleven) {
 try {
  // Get XREF and LocNumber from outside tables
  const Xref = getXref(CT, five, ten, eleven)
  const LocNo = getLocNumber(CT["Plant ID Code"]);

    await pool.query( `INSERT INTO public."856Measure"(
    msr_type, msr_key, msr_hl1, msr_bsn2, msr_bol, msr_heat, msr_mcoil, msr_prev, msr_mea1, msr_mea2, msr_mea3f, msr_mea3, msr_mea4, msr_n1sf, msr_n1st, msr_n1ma, msr_locn, msr_odat, msr_otim, msr_opgm, msr_xref)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21)`,
  [
    CT["Type (T=Toll; M=Margin; D=Direct Ship)"], 
    CT["Record Key (10-digit integer)"],
    forty["Item HL ID"], 
    five["ASN Number"],
    ten["Bill of Lading"],
    forty["Heat Number"],
    forty["Mill Coil Number"],
    forty["Previous/Processor Tag Nbr"],
    fortynine["Measurement Reference"],
    fortynine["Measurement Qualifier"],
    fortynine["Measurement Flag"],
    fortynine["Measurement Value"] ? fortynine["Measurement Value"] : null,
    fortynine["Measurement UOM"],
    ten["Ship From ID"],
    ten["Ship To ID"],
    thirty["Ultimate Customer PO Number"],
    LocNo ? LocNo : null,
      parseInt(new Date().toISOString().replace(/\D/g, '').slice(0, 8)), // or your preferred numeric date
      parseInt(new Date().toISOString().replace(/\D/g, '').slice(8, 14)), // or your preferred numeric time
    "856i.js",
    Xref ? Xref : null
  ]);


    //console.log('856 Measure inserted successfully');
  } catch (error) {
    console.error('Error inserting parsed records:', error);
  }}




  module.exports = {
  insert856Header,
  insert856Detail,
  insert856Measure,
  insert856Names
};