// ==UserScript==
// @name         post_insera
// @namespace    http://tampermonkey.net/
// @version      2.7
// @description  autofill ticket insera
// @author       afr
// @match        https://oss-incident.telkom.co.id/jw/web/userview/ticketIncidentService/ticketIncidentService/*
// @match        https://oss-incident.telkom.co.id/jw/web/embed/userview/ticketIncidentService/listInbox/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=co.id
// @grant        GM_xmlhttpRequest
// @require      https://ajax.googleapis.com/ajax/libs/jquery/3.5.1/jquery.min.js
// @updateURL    https://raw.githubusercontent.com/kharismaanjina/cso-script/main/post_insera_script.user.js
// @downloadURL  https://raw.githubusercontent.com/kharismaanjina/cso-script/main/post_insera_script.user.js
// @license      MIT
// ==/UserScript==


(function () {
  "use strict";


   var currentMonth = getCurrentMonth();
   var userName = $('.user-link>.dropdown-toggle').text().trim() || "";

  // waitForKeyEements
  /*--- waitForKeyElements():  A utility function, for Greasemonkey scripts,
  that detects and handles AJAXed content.

  Usage example:

      waitForKeyElements (
          "div.comments"
          , commentCallbackFunction
      );

      //--- Page-specific function to do what we want when the node is found.
      function commentCallbackFunction (jNode) {
          jNode.text ("This comment changed by waitForKeyElements().");
      }

  IMPORTANT: This function requires your script to have loaded jQuery.
*/
  function waitForKeyElements(
    selectorTxt,
    /* Required: The jQuery selector string thatur
                 specifies the desired element(s).
             */
    actionFunction,
    /* Required: The code to run when elements are
                    found. It is passed a jNode to the matched
                    element.
                */
    bWaitOnce,
    /* Optional: If false, will continue to scan for
               new elements even after the first match is
               found.
           */
    iframeSelector
    /* Optional: If set, identifies the iframe to
                   search.
               */
  ) {
    var targetNodes, btargetsFound;

    if (typeof iframeSelector == "undefined") targetNodes = $(selectorTxt);
    else targetNodes = $(iframeSelector).contents().find(selectorTxt);

    if (targetNodes && targetNodes.length > 0) {
      btargetsFound = true;
      /*--- Found target node(s).  Go through each and act if they
          are new.
      */
      targetNodes.each(function () {
        var jThis = $(this);
        var alreadyFound = jThis.data("alreadyFound") || false;

        if (!alreadyFound) {
          //--- Call the payload function.
          var cancelFound = actionFunction(jThis);
          if (cancelFound) btargetsFound = false;
          else jThis.data("alreadyFound", true);
        }
      });
    }
    else {
      btargetsFound = false;
    }

    //--- Get the timer-control variable for this selector.
    var controlObj = waitForKeyElements.controlObj || {};
    var controlKey = selectorTxt.replace(/[^\w]/g, "_");
    var timeControl = controlObj[controlKey];

    //--- Now set or clear the timer as appropriate.
    if (btargetsFound && bWaitOnce && timeControl) {
      //--- The only condition where we need to clear the timer.
      clearInterval(timeControl);
      delete controlObj[controlKey];
    }
    else {
      //--- Set a timer, if needed.
      if (!timeControl) {
        timeControl = setInterval(function () {
          waitForKeyElements(
            selectorTxt,
            actionFunction,
            bWaitOnce,
            iframeSelector
          );
        }, 300);
        controlObj[controlKey] = timeControl;
      }
    }
    waitForKeyElements.controlObj = controlObj;
  }

  //global Var

  const version = "1.0";

  $('document').ready(() => {
    window.oncontextmenu = null;
    // post with alt+1
    var map = [];
    onkeydown = onkeyup = function (e) {
      e = e || Event;
      map[e.key] = e.type === "keydown";
      if (map["Alt"] && map["1"]) {
        function getDatek() {
          let hl = $("input[id*='_summary']:first").val();
          let metroPatt = /([A-Z]+-[A-Z]+|[A-Z]+\d+[A-Z]+|[A-Z]+|[A-Z]+\d+)-D\d+-([A-Z]+-[A-Z]+|[A-Z]+)/g;
          let gponPatt = /GPON\d+-D\d+-[A-Z]+-(\d+[A-Z]+|\d+)/g;
          if (hl.match(metroPatt) === null && hl.match(gponPatt) === null) {
            return "";
          }
          else if (hl.match(gponPatt) === null) {
            return hl.match(metroPatt);
          }
          else {
            return hl.match(gponPatt);
          }
        }

        let patt = /[A-Z]{3}\d{3}/g;
        let datek = getDatek();

        const ticketId = $("div[id*='child_id_1_ticketUserInformationAfterRun']:eq(1) span:eq(1)").text();
        const ticketHL = $("input[id*='_summary']:first").val();
        const dateOpen = $("input[id*='_reported_date_']").val();
        const remedy = $("input[id*='_external_ticketid']").val();
        const impact = $("textarea[id*='_impacted_site']").val();

        let ticket = {
          ticketId: ticketId,
          ticketHL: ticketHL,
          dateOpen: dateOpen,
          remedy: remedy,
          impact: impact,
          datek: datek,
          version: version,
        };

        const details = {
          method: "PATCH",
            url:`https://cso-2025-fe71e-default-rtdb.asia-southeast1.firebasedatabase.app/data/tickets/${currentMonth}/${ticket.ticketId}.json`,
           //url: "https://autofill-2u8b.onrender.com/addlist",
          // url: 'http://localhost:3000/addlist',
        //   url: "https://autofill.faizruzain.site/addlist",
          headers: {
            "Content-Type": "application/json",
          },
          data: JSON.stringify(ticket),
          onerror: (err) => {
            console.log(err.responseText);
            console.log(err.statusText);
          },
          onload: (res) => {
            if (res.status === 200) {
              let notification = $("#notify");
              notification.slideDown(200);
              setTimeout(() => {
                notification.slideUp(200);
              }, 500);
            }
          },
        };
        GM_xmlhttpRequest(details);
        // if (impact.length !== 0) {
        //     GM_xmlhttpRequest(details);
        // }
        // else {
        //     console.log("Impacted Site cannot be empty");
        // }
      }
      else if (map["Alt"] && map["2"]) {
        const ticket = localStorage.getItem("ticket");
        let objTicket = JSON.parse(ticket);
        if (ticket) {
          const details = {
            method: "PATCH",
            url: `https://cso-2025-fe71e-default-rtdb.asia-southeast1.firebasedatabase.app/data/tickets/${currentMonth}/${objTicket.ticketId}.json`,
            // url: 'http://localhost:3000/list',
            // url: "https://autofill.faizruzain.site/list",
            headers: {
              "Content-Type": "application/json",
            },
            data: ticket,
            onerror: (err) => {
              console.log(err.responseText);
              console.log(err.statusText);
            },
            onload: (res) => {
              const notification = $("iframe#jqueryDialogFrame").contents().find("img#putNotify");
              notification.slideDown(200);
              setTimeout(() => {
                notification.slideUp(200);
              }, 500);

              // if (res.status === 200) {
              //     // $('button[class="ui-button ui-corner-all ui-widget ui-button-icon-only ui-dialog-titlebar-close"]').trigger("click");
              //     // console.log("kals;jdfh;adjois");
              //     // let notification = document.getElementsByTagName("iframe")[6].contentWindow.document.getElementById("putNotify");
              //     // console.log(notification);
              // }
            },
          };
          GM_xmlhttpRequest(details);

          localStorage.removeItem("ticket");
        }
      }
      else if (map["Alt"] && map["3"]) {
        // console.log('setImpact');
        let impact = $('textarea[id*="_details"]')
          .val()
          .toUpperCase()
          .match(/[A-Z]{3}\d{3}/gi);
        impact = [...new Set(impact)];
        let setImpact = `Jumlah Site:${impact.length}
2G:${impact.length}NE
3G:${impact.length}NE
4G:${impact.length}NE
Detail Site:
[${impact}]`;
        navigator.clipboard.writeText(setImpact); //copy to clipboard
      }
      else if (map["Alt"] && map["x"]) {
        $("button#bt-listView").trigger("click");
      }
      else if (map["Alt"] && map["4"]) {
        const ticketId = $("div[id*='child_id_1_ticketUserInformationAfterRun']:eq(1) span:eq(1)").text();
        const data = {
          ticketId: ticketId,
          worklogs: [],
          version: version
        }
        let created_date = [];
        let summary = [];
        let wl = [];
        // show all work logs
        $("table:eq(3) tr").each((i) => {
          if (i % 2 === 0) {
            $("tr").attr("class", "grid-row even pg-tr-show");
          }
          else {
            $("tr").attr("class", "grid-row odd pg-tr-show");
          }
        });
        // get created date
        $("table:eq(3) span[column_key='created_date']").html((i, content) => {
          if (i == 0) {
            return;
          }
          created_date.push(content.replace(/\s{2,}/g, ""));
          //console.log(content.replace(/\s+/, ""));
        });
        // get summary
        $("table:eq(3) span[column_key='summary']").html((i, content) => {
          if (i == 0) {
            return;
          }
          summary.push(content.replace(/\s{2,}/g, ""));
          //console.log(content.replace(/\s+/, ""));
        });
        console.log("CD: " + created_date.length + " || " + "Summary: " + summary.length);
        for (var i = 0; i < created_date.length; i++) {
          wl.push(`${created_date[i]} ${summary[i]}`);
        };
        data.worklogs = wl;

        const details = {
          method: "PATCH",
            url:`https://cso-2025-fe71e-default-rtdb.asia-southeast1.firebasedatabase.app/data/tickets/${currentMonth}/${ticketId}.json`,
           //url: "https://autofill-2u8b.onrender.com/update-worklogs",
          // url: 'http://localhost:3000/update-worklogs',
        //   url: "https://autofill.faizruzain.site/update-worklogs",
          headers: {
            "Content-Type": "application/json",
          },
          data: JSON.stringify(data),
          onerror: (err) => {
            console.log(err.responseText);
            console.log(err.statusText);
          },
          onload: (res) => {
            let notification = $("#notify");
            notification.slideDown(200);
            setTimeout(() => {
              notification.slideUp(200);
            }, 500);
          },
        };
        GM_xmlhttpRequest(details);
      }
    };
    // });
  });

  $("button#combinedTicketStatusModal").on("click", () => {
    // collecting data on click
    let ticketId;
    let ticketHL;
    let resolution;
    let dateClosed;
    let incidentDomain;
    let ttr_customer;
    let cts_cause = $("textarea[id*='_cts_cause']").val();
    let cts_resolution = $("textarea[id*='_cts_resolution']").val();

    ticketId = $("div.subform-cell:eq(1) span:eq(1)").text();
    ticketHL = $(
      "input[id*='_summary']:first"
    ).val();
    incidentDomain = $('input[list="a"]').val();
    resolution = cts_cause.length == cts_resolution.length ? cts_cause : cts_cause + "\n" + cts_resolution; //$('textarea[name*="resolution"]:first').val();
    ttr_customer = $("input[id*='_ttr_customer']").val().length == 0 ? $("input[id*='_ttr_end_to_end']").val() : $("input[id*='_ttr_customer']").val();
    ttr_customer = ttr_customer.match(/\d{1,}:\d{2}/)[0];

    if (/^00/.test(ttr_customer)) {
      // console.log("ada 00");
      ttr_customer = ttr_customer.replace(/0/, "");
    }
    else if (/^0/.test(ttr_customer)) {
      // console.log("ada 0 di depan");
      ttr_customer = ttr_customer.replace(/0/, "");
    }
    ttr_customer = ttr_customer.replace(/:/, ".");
    // console.log(ttr_customer);

    let ticket = {
      ticketId: ticketId,
      ticketHL: ticketHL,
      incidentDomain: incidentDomain,
      RFO_details: resolution,
      dateClosed: dateClosed,
      version: version,
      ttr_customer: ttr_customer
    };

    localStorage.setItem("ticket", JSON.stringify(ticket));
  });

  function getCurrentMonth(){
     const date = new Date();
     const month = date.toLocaleString('en-US', { month: 'short' }).toLowerCase();
     const year = date.getFullYear();

     const currentMonth = `${month}-${year}`;
     return currentMonth;
  }

  function notify(jNode) {
    jNode.before(
      '<img id="notify" src="https://media1.giphy.com/media/1xp0KDHzTY5GlDEpuL/giphy.gif?cid=ecf05e47i8j3sf6y4tr7vmxrmc2j4ujekfwplazmsue4hyeb&rid=giphy.gif&ct=s" />'
    );
    let notification = $("#notify");
    notification.css({
      display: "block",
      "margin-left": "auto",
      "margin-right": "auto",
      width: "50%",
      width: "50px",
      height: "50px",
    });
    notification.hide();
  }

  function test(jNode) {
    // console.log("FOUND!!");
    const rawTicket = localStorage.getItem("ticket");
    const parsedTicket = JSON.parse(rawTicket);
    const dateClosed = $(
      'tr[id*="_row_0"]:first td:nth-child(4) span#table_tikcet_history_DATECREATED'
    );
    parsedTicket.dateClosed = dateClosed
      .text()
      .match(/\d{4}-\d{2}-\d{2}\s\d{2}:\d{2}:\d{2}/)[0];
    localStorage.setItem("ticket", JSON.stringify(parsedTicket));
  }

  function ticketLogAction(ticketId , action){
      const details = {
          method: "POST",
            url:`https://cso-2025-fe71e-default-rtdb.asia-southeast1.firebasedatabase.app/data/tickets/${currentMonth}/${ticketId}/action.json`,
           //url: "https://autofill-2u8b.onrender.com/update-worklogs",
          // url: 'http://localhost:3000/update-worklogs',
        //   url: "https://autofill.faizruzain.site/update-worklogs",
          headers: {
            "Content-Type": "application/json",
          },
          data: JSON.stringify({ticketId:ticketId, action:action, user:userName}),
          onerror: (err) => {
            console.log(err.responseText);
          },
          onload: (res) => {
            console.log('ok');
          },
        };
        GM_xmlhttpRequest(details);
  }

  function createAndFillDataList(jNode) {
    jNode.after(
      '<div class="subform-cell customHtml no_label field239"> <div class="subform-cell-value form-cell-full"> <div class="subform-cell"> <label class="label">Onedigit</label> <div class="ui-screen-hidden"> </div> <span class="selector_element"> <input list="a" id="description_actualsolution_3" value="" class="double_field disableElement" placeholder="RootCause" > <datalist id="a"> </datalist> </input> </span> </div>'
    );
    const optionsList = [
      "TELKOM-CATUDAYA OLTREMOTE-KABELCATUAN",
      "TELKOM-CATUDAYA OLTREMOTE-METERPLNRUSAK",
      "TELKOM-CATUDAYA OLTREMOTE-PLNMATI",
      "TELKOM-CATUDAYA OLTREMOTE-PULSAPLNHABIS",
      "TELKOM-CATUDAYA OLTREMOTE-RECTIFIEROLT",
      "TELKOM-CATUDAYA STO-GENSETSTO",
      "TELKOM-CATUDAYA STO-METERPLNRUSAK",
      "TELKOM-CATUDAYA STO-PLNSTOMATI",
      "TELKOM-CATUDAYA STO-PULSAPLNHABIS",
      "TELKOM-CATUDAYA STO-RECTIFIERSTORUSAK",
      "TELKOM-DWDM-HANG",
      "TELKOM-DWDM-HILANG",
      "TELKOM-DWDM-KONFIGURASI",
      "TELKOM-DWDM-MODUL",
      "TELKOM-DWDM-SFP",
      "TELKOM-DWDM-SOFTWARE",
      "TELKOM-FO CORE/BACKBONE-BENDING",
      "TELKOM-FO CORE/BACKBONE-DEGRADED/BAD",
      "TELKOM-FO CORE/BACKBONE-GANGGUNHEWAN",
      "TELKOM-FO CORE/BACKBONE-JOINCLOSURE",
      "TELKOM-FO CORE/BACKBONE-PIHAK-3NONPROJECT",
      "TELKOM-FO CORE/BACKBONE-PIHAK-3PROJECT",
      "TELKOM-FO CORE/BACKBONE-TERTABRAK/TARIKKENDARAAN",
      "TELKOM-FO CORE/BACKBONE-VANDALISME",
      "TELKOM-FO CORE OLT-METRO-BENDING",
      "TELKOM-FO CORE OLT-METRO-DEGRADED/BAD",
      "TELKOM-FO CORE OLT-METRO-GANGGUNHEWAN",
      "TELKOM-FO CORE OLT-METRO-JOINCLOSURE",
      "TELKOM-FO CORE OLT-METRO-PIHAK-3NONPROJECT",
      "TELKOM-FO CORE OLT-METRO-PIHAK-3PROJECT",
      "TELKOM-FO CORE OLT-METRO-TERTABRAK/TARIKKENDARAAN",
      "TELKOM-FO CORE OLT-METRO-VANDALISME",
      "TELKOM-FO DISTRIBUSI-BENDING",
      "TELKOM-FO DISTRIBUSI-DEGRADED/BAD",
      "TELKOM-FO DISTRIBUSI-GANGGUNHEWAN",
      "TELKOM-FO DISTRIBUSI-JOINCLOSURE",
      "TELKOM-FO DISTRIBUSI-PIHAK-3NONPROJECT",
      "TELKOM-FO DISTRIBUSI-PIHAK-3PROJECT",
      "TELKOM-FO DISTRIBUSI-TERTABRAK/TARIKKENDARAAN",
      "TELKOM-FO DISTRIBUSI-VANDALISME",
      "TELKOM-FO DROPCORE-BENDING",
      "TELKOM-FO DROPCORE-DEGRADED/BAD",
      "TELKOM-FO DROPCORE-GANGGUNHEWAN",
      "TELKOM-FO DROPCORE-JOINCLOSURE",
      "TELKOM-FO DROPCORE-PIHAK-3NONPROJECT",
      "TELKOM-FO DROPCORE-PIHAK-3PROJECT",
      "TELKOM-FO DROPCORE-TERTABRAK/TARIKKENDARAAN",
      "TELKOM-FO DROPCORE-VANDALISME",
      "TELKOM-FO FEEDER-BENDING",
      "TELKOM-FO FEEDER-DEGRADED/BAD",
      "TELKOM-FO FEEDER-GANGGUNHEWAN",
      "TELKOM-FO FEEDER-JOINCLOSURE",
      "TELKOM-FO FEEDER-PIHAK-3NONPROJECT",
      "TELKOM-FO FEEDER-PIHAK-3PROJECT",
      "TELKOM-FO FEEDER-TERTABRAK/TARIKKENDARAAN",
      "TELKOM-FO FEEDER-VANDALISME",
      "TELKOM-FO LINK-KE2 DISTRIBUSIPREMIUMSITE-BENDING",
      "TELKOM-FO LINK-KE2 DISTRIBUSIPREMIUMSITE-DEGRADED/BAD",
      "TELKOM-FO LINK-KE2 DISTRIBUSIPREMIUMSITE-GANGGUNHEWAN",
      "TELKOM-FO LINK-KE2 DISTRIBUSIPREMIUMSITE-PIHAK-3NONPROJECT",
      "TELKOM-FO LINK-KE2 DISTRIBUSIPREMIUMSITE-PIHAK-3PROJECT",
      "TELKOM-FO LINK-KE2 DISTRIBUSIPREMIUMSITE-TERTABRAK/TARIKKENDARAAN",
      "TELKOM-FO LINK-KE2 DISTRIBUSIPREMIUMSITE-VANDALISME",
      "TELKOM-FO LINK-KE2 DROPCOREPREMIUMSITE-BENDING",
      "TELKOM-FO LINK-KE2 DROPCOREPREMIUMSITE-DEGRADED/BAD",
      "TELKOM-FO LINK-KE2 DROPCOREPREMIUMSITE-GANGGUNHEWAN",
      "TELKOM-FO LINK-KE2 DROPCOREPREMIUMSITE-PIHAK-3NONPROJECT",
      "TELKOM-FO LINK-KE2 DROPCOREPREMIUMSITE-PIHAK-3PROJECT",
      "TELKOM-FO LINK-KE2 DROPCOREPREMIUMSITE-TERTABRAK/TARIKKENDARAAN",
      "TELKOM-FO LINK-KE2 DROPCOREPREMIUMSITE-VANDALISME",
      "TELKOM-FO LINK-KE2 FEEDERPREMIUMSITE-BENDING",
      "TELKOM-FO LINK-KE2 FEEDERPREMIUMSITE-DEGRADED/BAD",
      "TELKOM-FO LINK-KE2 FEEDERPREMIUMSITE-GANGGUNHEWAN",
      "TELKOM-FO LINK-KE2 FEEDERPREMIUMSITE-PIHAK-3NONPROJECT",
      "TELKOM-FO LINK-KE2 FEEDERPREMIUMSITE-PIHAK-3PROJECT",
      "TELKOM-FO LINK-KE2 FEEDERPREMIUMSITE-TERTABRAK/TARIKKENDARAAN",
      "TELKOM-FO LINK-KE2 FEEDERPREMIUMSITE-VANDALISME",
      "TELKOM-FO PATCHCORE GPON-ODF-BENDING",
      "TELKOM-FO PATCHCORE GPON-ODF-DEGRADED/BAD",
      "TELKOM-FO PATCHCORE GPON-ODF-GANGGUNHEWAN",
      "TELKOM-FO PATCHCORE GPON-ODF-PIHAK-3NONPROJECT",
      "TELKOM-FO PATCHCORE GPON-ODF-PIHAK-3PROJECT",
      "TELKOM-FO PATCHCORE GPON-ODF-TERTABRAK/TARIKKENDARAAN",
      "TELKOM-FO PATCHCORE GPON-ODF-VANDALISME",
      "TELKOM-FO PATCHCORE ME-GPON-BENDING",
      "TELKOM-FO PATCHCORE ME-GPON-DEGRADED/BAD",
      "TELKOM-FO PATCHCORE ME-GPON-GANGGUNHEWAN",
      "TELKOM-FO PATCHCORE ME-GPON-PIHAK-3NONPROJECT",
      "TELKOM-FO PATCHCORE ME-GPON-PIHAK-3PROJECT",
      "TELKOM-FO PATCHCORE ME-GPON-TERTABRAK/TARIKKENDARAAN",
      "TELKOM-FO PATCHCORE ME-GPON-VANDALISME",
      "TELKOM-FO PATCHCORE TOBTS-BENDING",
      "TELKOM-FO PATCHCORE TOBTS-DEGRADED/BAD",
      "TELKOM-FO PATCHCORE TOBTS-GANGGUNHEWAN",
      "TELKOM-FO PATCHCORE TOBTS-PIHAK-3NONPROJECT",
      "TELKOM-FO PATCHCORE TOBTS-PIHAK-3PROJECT",
      "TELKOM-FO PATCHCORE TOBTS-TERTABRAK/TARIKKENDARAAN",
      "TELKOM-FO PATCHCORE TOBTS-VANDALISME",
      "TELKOM-FO PERTENG-CUT",
      "TELKOM-FO PRB-CUT",
      "TELKOM-FO PRT-CUT",
      "TELKOM-FORCEMAJOR-BANJIR",
      "TELKOM-FORCEMAJOR-LONGSOR",
      "TELKOM-FORCEMAJOR-PETIR",
      "TELKOM-FO SKKL-PUTUS",
      "TELKOM-GPON OLT-HANG",
      "TELKOM-GPON OLT-KONFIGURASI",
      "TELKOM-GPON OLT-MODUL",
      "TELKOM-GPON OLT-SFP",
      "TELKOM-GPON OLT-SOFTWARE",
      "TELKOM-GPON OLT-TERTABRAK",
      "TELKOM-GPON ONT-HANG",
      "TELKOM-GPON ONT-HILANG",
      "TELKOM-GPON ONT-KONFIGURASI",
      "TELKOM-GPON ONT-MODUL",
      "TELKOM-GPON ONT-SFP",
      "TELKOM-GPON ONT-SOFTWARE",
      "TELKOM-L2-SWTCH-HILANG",
      "TELKOM-L2-SWTCH-KONFIGURASI",
      "TELKOM-L2-SWTCH-MODUL",
      "TELKOM-METRO-HANG",
      "TELKOM-METRO-HILANG",
      "TELKOM-METRO-KONFIGURASI",
      "TELKOM-METRO-MODUL",
      "TELKOM-METRO-SFP",
      "TELKOM-METRO-SOFTWARE",
      "TELKOM-ODC-ODCBADPORT",
      "TELKOM-ODC-ODCBOCOR",
      "TELKOM-ODC-ODCGANGGUANHEWAN",
      "TELKOM-ODC-ODCTERTABRAK",
      "TELKOM-ODF-ODFBADPORT",
      "TELKOM-ODF-ODFBOCOR",
      "TELKOM-ODF-ODFGANGGUANHEWAN",
      "TELKOM-ODF-ODFTERTABRAK",
      "TELKOM-ODP-ODPBADPORT",
      "TELKOM-ODP-ODPBOCOR",
      "TELKOM-ODP-ODPGANGGUANHEWAN",
      "TELKOM-QUALITYFO AKSES-LOWCAPACITY",
      "TELKOM-QUALITYFO AKSES-TXRXRENDAH/REDAMANTINGGI",
      "TELKOM-QUALITYFO BACKBONE-LOWCAPACITY",
      "TELKOM-QUALITYFO BACKBONE-TXRXRENDAH/REDAMANTINGGI",
      "TELKOM-QUALITYRADIOIP-LOWCAPACITY",
      "TELKOM-QUALITYRADIOIP-RSLFLIKER/RENDAH",
      "TELKOM-QUALITYRADIOLH-LOWCAPACITY",
      "TELKOM-QUALITYRADIOLH-RSLFLIKER/RENDAH",
      "TELKOM-RADIOIP-ANTENNA",
      "TELKOM-RADIOIP-COAXIAL",
      "TELKOM-RADIOIP-FANIDU",
      "TELKOM-RADIOIP-IDUSET",
      "TELKOM-RADIOIP-INTERFRENCE",
      "TELKOM-RADIOIP-ISR/SEGELBALMON",
      "TELKOM-RADIOIP-KONEKTORCOAXIAL",
      "TELKOM-RADIOIP-LINKOBSTACLE",
      "TELKOM-RADIOIP-MODULIDU",
      "TELKOM-RADIOIP-MODULPOWERIDU",
      "TELKOM-RADIOIP-ODU",
      "TELKOM-RADIOLH-ANTENNA",
      "TELKOM-RADIOLH-COAXIAL",
      "TELKOM-RADIOLH-FANIDU",
      "TELKOM-RADIOLH-IDUSET",
      "TELKOM-RADIOLH-INTERFRENCE",
      "TELKOM-RADIOLH-ISR/SEGELBALMON",
      "TELKOM-RADIOLH-KONEKTORCOAXIAL",
      "TELKOM-RADIOLH-LINKOBSTACLE",
      "TELKOM-RADIOLH-MODULIDU",
      "TELKOM-RADIOLH-MODULPOWERIDU",
      "TELKOM-RADIOLH-ODU",
      "TELKOM-ROUTER-HANG",
      "TELKOM-ROUTER-HILANG",
      "TELKOM-ROUTER-KONFIGURASI",
      "TELKOM-ROUTER-MODUL",
      "TELKOM-ROUTER-SFP",
      "TELKOM-ROUTER-SOFTWARE",
      "TELKOM-SATELIT-PUTUS",
      "TELKOMSEL-CATUDAYA SITE-PLNMATI",
      "TELKOMSEL-FO -PUTUS FO TSEL",
      "TELKOMSEL-GROUNDING-HILANG PUTUS/TIDAK ADA",
      "TELKOMSEL-IKGSITE-NO IKG",
      "TELKOMSEL-ISP(NE,DLL)-ISP PUTUS",
      "TELKOMSEL-KONTRAKTENANT-NO KONTRAK",
      "TELKOMSEL-LANBTS-PUTUS LAN",
      "TELKOMSEL-PENDINGINRUANGAN-MATI AC",
      "TELKOM-RADIOIP- SHELTER BOCOR",
      "TELKOM-STM64 MODUL",
      "TELKOM-STM64 HANG",
      "TELKOM- STM64 SFP",
      "TELKOM-ODP KONEKTOR",
      "TELKOM- ODC-KONEKTOR",
      "TELKOM- OTB",
      "TELKOM-OTB KONEKTOR",
      "TELKOM- FO ME TO OTB SITE",
      "TELKOM- FO ME TO IDU-GANGGUAN HEWAN",
      "TELKOM- PATCHCORE ME TO IDU BENDING",
      "TELKOM- PATCHCORE ME TO IDU GANGGUANHEWAN",
      "TELKOM-FORCEMAJOR-HUJANBADAI",
      "TELKOM-FORCEMAJOR-KEBAKARAN",
      "TELKOM-RADIOIP-MODUL/PERANGKAT HANG",
      "TELKOM-RADIOIP-MISSED CONFIG",
      "TELKOM-CANCEL TIKET",
      "TELKOM-NO-CRA-ACTIVITY",
      "TELKOM-CRA ACTIVITY",
    ];
    const container = $("datalist#a");
    for (var i = 0; i < optionsList.length; i++) {
      const option = document.createElement("option");
      option.value = optionsList[i];
      container.append(option);
    }
  }

  function putNotify(jNode) {
    // console.log("PUTNOTIFY!!!!!!!!!!!!!");
    jNode.on("load", () => {
      jNode
        .contents()
        .find("table:first")
        .before(
          '<img id="putNotify" src="https://media.giphy.com/media/yiXnrmaqVn0pcuCllX/giphy.gif" />'
        );
      let notification = $("iframe#jqueryDialogFrame")
        .contents()
        .find("#putNotify");
      // console.log(notification);
      notification.css({
        display: "block",
        "margin-left": "auto",
        "margin-right": "auto",
        width: "50%",
        width: "50px",
        height: "50px",
      });
      notification.hide();
      // notification.slideDown(200);
    });
  }

  function triggerCloseButton() {
    // console.log("got that close button");
    $(
      'button[class="ui-button ui-corner-all ui-widget ui-button-icon-only ui-dialog-titlebar-close"]'
    ).on("click", () => {
      $('div[aria-describedby="jqueryDialogDiv"]').remove();
    });
  }

  // function fClose() {
  //     console.log("klasdjbfialsdbfailsdhjbf");
  //     $(
  //         'button[class="ui-button ui-corner-all ui-widget ui-button-icon-only ui-dialog-titlebar-close"]'
  //     ).trigger("click");
  // }

  function saveValue(jNode) {
    var ticketId = $("div[id*='child_id_1_ticketUserInformationAfterRun']:eq(1) span:eq(1)").text();
    var data = localStorage.getItem(ticketId);

    jNode.on("change", (e) => {
      localStorage.setItem(ticketId, e.currentTarget.value);
      // console.log(e.currentTarget.value);
    });

    if (!data) {
      $("input[list='a']").val("");
    }
    else if (data) {
      $("input[list='a']").val(data);
    }
  }

  waitForKeyElements("#header-title-ticket", notify);
  waitForKeyElements(
    'tr[id*="_row_0"]:first td:nth-child(4) span#table_tikcet_history_DATECREATED',
    test
  );
  waitForKeyElements(
    'div[class*="field"].subform-cell.customHtml.no_label:eq(26)',
    createAndFillDataList
  );
  waitForKeyElements("iframe#jqueryDialogFrame", putNotify);
  waitForKeyElements(
    'button[class="ui-button ui-corner-all ui-widget ui-button-icon-only ui-dialog-titlebar-close"]',
    triggerCloseButton
  );
  waitForKeyElements("input[list='a']", saveValue);
})();
