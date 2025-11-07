// ==UserScript==
// @name           auto-fill-onedigit
// @namespace      http://tampermonkey.net/
// @version        5.8
// @description    like a boss
// @author         afr
// @include        /https:\/{2}onedigit.telkom.co.id\/tiket/
// @include        /https:\/{2}onedigit.telkom.co.id\/tiket\/\S+/
// @icon           https://www.google.com/s2/favicons?domain=co.id
// @grant          GM_xmlhttpRequest
// @copyright      2021
// @updateURL      https://raw.githubusercontent.com/kharismaanjina/cso-script/main/auto_fill_onedigit_script.user.js
// @downloadURL    https://raw.githubusercontent.com/kharismaanjina/cso-script/main/auto_fill_onedigit_script.user.js
// @license        MIT
// ==/UserScript==

(function () {
  "use strict";
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
    /* Required: The jQuery selector string that
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

  //'use strict';

  function autoFill(jNode) {
    jNode.on("paste", () => {
      function setImpact(hl, rawImpact) {
        let metro = /metro/i;
        let radioip = /radioip/i;
        let metrolite = /lite/i;
        if (metrolite.test(hl)) {
          return "";
        }
        else if (radioip.test(hl) || metro.test(hl)) {
          return `Jumlah Site:${rawImpact.length}
2G:${rawImpact.length}NE
3G:${rawImpact.length}NE
4G:${rawImpact.length}NE
Detail Site:
${rawImpact}`;
        }
        else {
          return rawImpact;
        }
      }

      function totalImpact(hl, impact) {
        let metro = /metro/i;
        let radioip = /radioip/i;
        let metrolite = /lite/i;

        if (metrolite.test(hl)) {
          return "";
        }
        else if (radioip.test(hl) || metro.test(hl)) {
          return impact.length;
        }
        else {
          return impact[0].match(/\d+/i);
        }
      }

      setTimeout(() => {
        const query = document.querySelector("#TTiketcase_faultnb").value;
        const details = {
          method: "GET",
          url: `https://cso-2025-fe71e-default-rtdb.asia-southeast1.firebasedatabase.app/data/tickets/${query}.json`,
          // url: `http://localhost:3000/list?id=${query}`,
          // url: `https://autofill.faizruzain.site/list?id=${query}`,
          responseType: "json",
          onload: (res) => {
            const data = JSON.parse(res.responseText);
            const radioip = /radioip/i;
            const metro = /metro/i;
            const sld = /sld/i;
            const cnop = /cnop/i;
            const radiolh = /radiolh/i;
            const iptransit = /iptransit/i;
            const backhaul = /BACKHAUL/i;
            const idr = /idr/i;
            const down = /down/i;
            const quality = /quality/i;
            const proaktif = /PROAKTIF|PREVENTIVE/i;
            const partial = /partial/i;
            const metrolite = /lite/i;
            const siteID = /\w{3}\d{3}/;
            const nogaransi = /NOGARANSI/;
            const gamas = /([7-9]|[1-9]\d+)NODEB/g;
            const ceragon = /ceragon/i;
            const description = data.ticketHL;
            console.log(data.impact);
            //                         const rawImpact = data.impact
            //                         const impact = `Jumlah Site:${rawImpact.length}
            // 2G:${rawImpact.length}NE
            // 3G:${rawImpact.length}NE
            // 4G:${rawImpact.length}NE
            // Detail Site:
            // ${rawImpact}`
            data.dateOpen = formatedDate(data.dateOpen);
            document.querySelector("#TTiketcase_description").value =
              data.ticketHL;
            document.querySelector("#TTiketcase_dateOpen").value =
              data.dateOpen;
            if (radioip.test(description)) {
              document.querySelector("#TTiketcase_starttime").value =
                data.dateOpen;
            }
            // if (!sld.test(description) && !radiolh.test(description) && !iptransit.test(description) && !backhaul.test(description)) {
            //     document.querySelector('#TTiketcase_impact').value = impact
            //     document.querySelector('#TTiketcase_jmlservice').value = rawImpact.length
            // }
            document.querySelector("#TTiketcase_impact").value = data.impact; //setImpact(description, data.impact)
            document.querySelector("#TTiketcase_jmlservice").value =
              data.impact[0].match(/\d+/i); //totalImpact(description, data.impact)
            document.querySelector("#TTiketcase_noRemedy").value = data.remedy;
            document.querySelector("#TTiketcase_siteA").value = backhaul.test(
                description
              ) ?
              "" :
              data.datek;

            if (radioip.test(description)) {
              document.querySelector(
                "#TTiketcase_actGroupGgn"
              ).options[1].selected = true;
              document.querySelector(
                "#TTiketcase_productName"
              ).options[3].selected = true;
              document.querySelector("#TTiketcase_siteId").value =
                description.match(siteID);
              if (
                parseInt(
                  document.querySelector("#TTiketcase_jmlservice").value
                ) >= 7
              ) {
                //console.log("gamas");
                document.querySelector("#TTiketcase_ownerGgn").options[7].selected = true;
              }
              else if (down.test(description)) {
                document.querySelector(
                  "#TTiketcase_ownerGgn"
                ).options[7].selected = true;
              }
              else if (proaktif.test(description) || data.remedy.length === 0) {
                document.querySelector("#TTiketcase_ownerGgn").options[4].selected = true;
              }
              else if (quality.test(description)) {
                document.querySelector(
                  "#TTiketcase_ownerGgn"
                ).options[3].selected = true;
              }
              else if (partial.test(description)) {
                document.querySelector(
                  "#TTiketcase_ownerGgn"
                ).options[7].selected = true;
              }
              if (nogaransi.test(description)) {
                document.querySelector(
                  "#TTiketcase_garansi"
                ).options[2].selected = true;
              }
              else if (!nogaransi.test(description)) {
                document.querySelector(
                  "#TTiketcase_garansi"
                ).options[1].selected = true;
              }
            }
            else if (metro.test(description)) {
              metrolite.test(description) ?
                (document.querySelector(
                  "#TTiketcase_actGroupGgn"
                ).options[4].selected = true) :
                (document.querySelector(
                  "#TTiketcase_actGroupGgn"
                ).options[3].selected = true);
              metrolite.test(description) ?
                (document.querySelector(
                  "#TTiketcase_productName"
                ).options[3].selected = true) :
                (document.querySelector(
                  "#TTiketcase_productName"
                ).options[2].selected = true);
              document.querySelector(
                "#TTiketcase_keterangan"
              ).value = `${data.dateOpen} On koordinasi dengan rekan MSO dan tim terkait.`;
              metrolite.test(description) ?
                "" :
                (document.querySelector("#TTiketcase_siteId").value =
                  description.match(siteID));
              if (
                description.match(gamas) ||
                parseInt(
                  document.querySelector("#TTiketcase_jmlservice").value
                ) >= 7
              ) {
                if (!quality.test(description)) {
                  document.querySelector(
                    "#TTiketcase_ownerGgn"
                  ).options[7].selected = true;
                  document.querySelector("#TTiketcase_starttime").value =
                    data.dateOpen;
                }
                else {
                  document.querySelector(
                    "#TTiketcase_ownerGgn"
                  ).options[7].selected = true;
                }
              }
              else if (down.test(description)) {
                document.querySelector(
                  "#TTiketcase_ownerGgn"
                ).options[7].selected = true;
              }
              else if (quality.test(description)) {
                document.querySelector(
                  "#TTiketcase_ownerGgn"
                ).options[3].selected = true;
              }
              else if (proaktif.test(description)) {
                document.querySelector(
                  "#TTiketcase_ownerGgn"
                ).options[4].selected = true;
              }
              else if (partial.test(description)) {
                document.querySelector(
                  "#TTiketcase_ownerGgn"
                ).options[7].selected = true;
              }
            }
            else if (sld.test(description) && !ceragon.test(description)) {
              let pattSiteA =
                /\d+STM\d+.+TO|\d+X\d+[A-Z].+TO|\d+[A-Z]+.+TO|STM\d+.+TO/gi;
              let pattSiteB = /TO.+VIA|TO.+HIGHCAP|TO.+LOWCAP|TO.+DOWN/gi;
              let siteA = description.match(pattSiteA);
              let siteB = description.match(pattSiteB);
              siteA = siteA[0].replace(
                /\d+STM\d+_|\d+[A-Z]+_|\d+[A-Z]+|STM\d+_|_TO/gi,
                ""
              );
              siteB = siteB[0].replace(/TO_|_VIA|_HIGHCAP|_LOWCAP/gi, "");
              document.querySelector("#TTiketcase_siteA").value = siteA;
              document.querySelector("#TTiketcase_siteB").value = siteB;
              document.querySelector(
                "#TTiketcase_actGroupGgn"
              ).options[4].selected = true;
              document.querySelector(
                "#TTiketcase_productName"
              ).options[1].selected = true;
              document.querySelector(
                "#TTiketcase_keterangan"
              ).value = `${data.dateOpen} On koordinasi dengan rekan MSO dan tim terkait.`;
              if (down.test(description)) {
                document.querySelector(
                  "#TTiketcase_ownerGgn"
                ).options[7].selected = true;
              }
              else if (quality.test(description)) {
                document.querySelector(
                  "#TTiketcase_ownerGgn"
                ).options[3].selected = true;
              }
              else if (proaktif.test(description)) {
                document.querySelector(
                  "#TTiketcase_ownerGgn"
                ).options[4].selected = true;
              }
            }
            else if (radiolh.test(description) || ceragon.test(description)) {
              function cap(hl) {
                let capPatt = /\d+[A-Z]+\d+[A-Z]+|\d+[A-Z]+/i;
                let cap = hl.match(capPatt);
                if (cap) {
                  cap = cap[0].replace(/g+|\d+x|mb|m/gi, "");
                  if (cap.length === 1) {
                    return cap + "000";
                  }
                  else {
                    return cap;
                  }
                }
                else {
                  return null;
                }
              }
              let pattSiteA = /RADIOLH.+_TO_|\d+[a-z]+\d+[a-z]+.+TO_/gi;
              let pattSiteB = /TO_.+(VIA|DOWN)/gi;
              let siteA = description.match(pattSiteA);
              let siteB = description.match(pattSiteB);
              siteA = siteA[0].replace(
                /RADIOLH_\d+[A-Z]+\d+[A-Z]+_|\d+[A-Z]+_|RADIOLH_|\d+[a-z]+\d+[a-z]+.|_TO_/gi,
                ""
              );
              siteB = siteB[0].replace(/TO_|_DOWN|_VIA|_LOWCAP|_CERAGON/gi, "");
              document.querySelector("#TTiketcase_siteA").value = siteA;
              document.querySelector("#TTiketcase_siteB").value = siteB;
              document.querySelector(
                "#TTiketcase_actGroupGgn"
              ).options[2].selected = true;
              document.querySelector(
                "#TTiketcase_productName"
              ).options[1].selected = true;
              document.querySelector(
                "#TTiketcase_keterangan"
              ).value = `${data.dateOpen} On koordinasi dengan rekan MSO dan tim terkait.`;
              document.querySelector("#TTiketcase_capacity").value =
                cap(description);
              if (down.test(description)) {
                document.querySelector(
                  "#TTiketcase_ownerGgn"
                ).options[7].selected = true;
              }
              else if (quality.test(description)) {
                document.querySelector(
                  "#TTiketcase_ownerGgn"
                ).options[3].selected = true;
              }
              else if (proaktif.test(description)) {
                document.querySelector(
                  "#TTiketcase_ownerGgn"
                ).options[4].selected = true;
              }
            }
            else if (iptransit.test(description)) {
              let pattSiteA = /(\d+[a-z]+\d+[a-z]+|\d+[a-z]+).+VIA/i;
              let siteA = description.match(pattSiteA);
              siteA = siteA[0].replace(
                /(\d+[a-z]+\d+[a-z]+.|\d+[a-z]+.)|(_VIA|_TO)/gi,
                ""
              );
              let pattSiteB = /([a-z]+|[a-z]+\d+)-[a-z]+\d+-[a-z]+-[a-z]+/gi;
              let siteB = description.match(pattSiteB);
              document.querySelector("#TTiketcase_siteA").value = siteA;
              document.querySelector("#TTiketcase_siteB").value = siteB;
              document.querySelector(
                "#TTiketcase_actGroupGgn"
              ).options[4].selected = true;
              document.querySelector(
                "#TTiketcase_productName"
              ).options[5].selected = true;
              document.querySelector(
                "#TTiketcase_keterangan"
              ).value = `${data.dateOpen} On koordinasi dengan rekan MSO dan tim terkait.`;
              if (down.test(description)) {
                document.querySelector(
                  "#TTiketcase_ownerGgn"
                ).options[7].selected = true;
              }
              else if (quality.test(description)) {
                document.querySelector(
                  "#TTiketcase_ownerGgn"
                ).options[3].selected = true;
              }
              else if (proaktif.test(description)) {
                document.querySelector(
                  "#TTiketcase_ownerGgn"
                ).options[4].selected = true;
              }
            }
            else if (backhaul.test(description)) {
              let metroPatt = /([A-Z]+|[A-Z]+\d+)-D\d+-[A-Z]+/gi;
              let gponPatt = /[A-Z]+\d+-D\d+-[A-Z]+-(\d+[A-Z]+|\d+)/gi;
              let pattSiteA = /\d+[a-z]+\d+[a-z]+.+(TO|VIA)/i;
              let siteA = description.match(pattSiteA);
              siteA = siteA[0].replace(/\d+[a-z]+\d+[a-z]+_|_VIA|_TO/gi, "");
              let siteB =
                description.match(gponPatt) === null ?
                description.match(metroPatt) :
                description.match(gponPatt);
              let pattCap = /\d+g/i;
              let cap = description.match(pattCap);
              cap = cap[0].replace(/g/i, "") + "000";
              document.querySelector("#TTiketcase_siteA").value = siteA;
              document.querySelector("#TTiketcase_siteB").value = siteB;
              document.querySelector(
                "#TTiketcase_actGroupGgn"
              ).options[3].selected = true;
              document.querySelector(
                "#TTiketcase_productName"
              ).options[2].selected = true;
              document.querySelector("#TTiketcase_capacity").value = cap;
              document.querySelector(
                "#TTiketcase_keterangan"
              ).value = `${data.dateOpen} On koordinasi dengan rekan MSO dan tim terkait.`;
              if (down.test(description)) {
                document.querySelector(
                  "#TTiketcase_ownerGgn"
                ).options[7].selected = true;
              }
              else if (quality.test(description)) {
                document.querySelector(
                  "#TTiketcase_ownerGgn"
                ).options[3].selected = true;
              }
              else if (proaktif.test(description)) {
                document.querySelector(
                  "#TTiketcase_ownerGgn"
                ).options[4].selected = true;
              }
            }
            else if (idr.test(description)) {
              console.log("IDR");
              let pattSiteA = /\d+[a-z]+\d+[a-z]+.+TO/i;
              let siteA = description.match(pattSiteA);
              siteA = siteA[0].replace(/\d+[a-z]+\d+[a-z]+_|_TO/gi, "");
              let pattSiteB = /TO.+(VIA|LOWCAP|HIGHCAP)/i;
              let siteB = description.match(pattSiteB);
              siteB = siteB[0].replace(/TO_|_VIA|_LOWCAP/gi, "");
              let capPatt = /\d+[a-z]+\d+[a-z]+/i;
              let cap = description.match(capPatt);
              cap = cap[0].match(/\d{2,}/gi);
              document.querySelector("#TTiketcase_siteA").value = siteA;
              document.querySelector("#TTiketcase_siteB").value = siteB;
              document.querySelector("#TTiketcase_capacity").value = cap;
              document.querySelector(
                "#TTiketcase_actGroupGgn"
              ).selectedIndex = 5;
              document.querySelector(
                "#TTiketcase_productName"
              ).selectedIndex = 1;
              document.querySelector("#TTiketcase_ownerGgn").selectedIndex = 8;
              document.querySelector(
                "#TTiketcase_keterangan"
              ).value = `${data.dateOpen} On koordinasi dengan rekan MSO dan tim terkait.`;
              if (down.test(description)) {
                document.querySelector(
                  "#TTiketcase_ownerGgn"
                ).options[7].selected = true;
              }
              else if (quality.test(description)) {
                document.querySelector(
                  "#TTiketcase_ownerGgn"
                ).options[3].selected = true;
              }
              else if (proaktif.test(description)) {
                document.querySelector(
                  "#TTiketcase_ownerGgn"
                ).options[4].selected = true;
              }
            }
            else if (cnop.test(description)) {
              var cap = description.match(/\d+x\d+/i);
              cap = description.match(/\d+/ig);
              cap = cap[0] * cap[1] * 1000000;

              var siteA = description.match(/G_.+_TO/ig);
              siteA = siteA[0].replace(/G_|_TO|_/ig, "");

              var siteB = description.match(/TO_.+(_HIGHCAP|_PREVENTIVE)/ig);
              siteB = siteB[0].replace(/TO_|_HIGHCAP|_PREVENTIVE|_/ig, "");

              document.querySelector("#TTiketcase_siteA").value = siteB;
              document.querySelector("#TTiketcase_siteB").value = siteA;
              document.querySelector("#TTiketcase_capacity").value = cap;
              document.querySelector("#TTiketcase_actGroupGgn").selectedIndex = 4;
              document.querySelector("#TTiketcase_productName").selectedIndex = 1;
              document.querySelector("#TTiketcase_ownerGgn").selectedIndex = 7;
              document.querySelector("#TTiketcase_keterangan").value = `${data.dateOpen} On koordinasi dengan rekan MSO dan tim terkait.`;
            }

            if (
              siteID.test(description) &&
              !sld.test(description) &&
              !radiolh.test(description) &&
              !iptransit.test(description) &&
              !backhaul.test(description)
            ) {
              // next step -> siteID
              $(".search-button.btn.btn-info")[0].click();
              setTimeout(() => {
                $(".filter-container")[21].childNodes[0].value =
                  description.match(siteID);
                $(".filter-container")[21].childNodes[0].focus();
                $(".filter-container")[21].childNodes[0].select();
              }, 700);
            }
          },
        };
        GM_xmlhttpRequest(details);
      }, 100);
    });
  }

  function paste(jNode) {
    jNode.on("paste", () => {
      const radioip = document.querySelector("#TTiketcase_productName").options
        .selectedIndex;
      const gamas = document.querySelector("#TTiketcase_ownerGgn").options
        .selectedIndex;
      if (radioip === 3 || gamas === 7) {
        setTimeout(() => {
          let close = document.querySelector("#TTiketcase_dateClose").value;
          document.querySelector("#TTiketcase_endtime").value = close;
        }, 100);
      }
    });
  }

  function impactNum(jNode) {
    jNode.on("paste", () => {
      setTimeout(() => {
        const val = document.querySelector("#TTiketcase_impact").value;
        const impactNum = val.match(/\d+/);
        document.querySelector("#TTiketcase_jmlservice").value = impactNum;
      }, 100);
    });
  }

  function formatedDate(date){
      const input = "2025-11-05 21:54:27";
      if(!date) return null;

      // Pisahkan tanggal dan waktu
      const [datePart, timePart] = date.split(" "); // ["2025-11-05", "21:54:27"]

      // Pisahkan tanggal jadi komponen
      const [year, month, day] = datePart.split("-");

      // Susun ulang jadi format dd-MM-yyyy HH:mm:ss
      const formatted = `${day}-${month}-${year} ${timePart}`;

      return formatted;
  }

  function close(jNode) {
    jNode.on("change", (event) => {
      if (event.target.value === "CLOSED") {
        console.log(event.target.value);
        const query = document.querySelector("#TTiketcase_faultnb").value;
        const details = {
          method: "GET",
          url: `https://cso-2025-fe71e-default-rtdb.asia-southeast1.firebasedatabase.app/data/tickets/${query}.json`,
          // url: `http://localhost:3000/list?id=${query}`,
          //   url: `https://autofill.faizruzain.site/list?id=${query}`,
          responseType: "json",
          onload: (res) => {
            const data = JSON.parse(res.responseText);
            if (data.message === "no data found") {
              return;
            }

            data.dateClosed = formatedDate(data.dateClosed);
            //const array = data.actualSolution.split("-")
            //const actualSolution = array[2].replace(/\W/, "")
            let initRFO = document.querySelector(
              "#TTiketcase_keterangan"
            ).value;
            const dateOpen = document.querySelector(
              "#TTiketcase_dateOpen"
            ).value;
            const optionsObj = document.querySelector(
              "#TTiketcase_rootcause"
            ).options;
            $("#TTiketcase_ttrRec").val(data.ttr_customer);
            for (const property in optionsObj) {
              if (optionsObj[property].value === data.incidentDomain) {
                document.querySelector("a.select2-choice span").innerText =
                  data.incidentDomain;
                document.querySelector(
                  "#TTiketcase_rootcause"
                ).options.selectedIndex = property;
              }
            }
            if (
              document.querySelector("#TTiketcase_actGroupGgn")
              .selectedIndex === 1
            ) {
              // radioip
              document.querySelector("#TTiketcase_dateClose").value =
                data.dateClosed;
              document.querySelector("#TTiketcase_starttime").value = dateOpen;
              document.querySelector("#TTiketcase_endtime").value =
                data.dateClosed;
              if (
                document.querySelector("#TTiketcase_keterangan").value
                .length === 0
              ) {
                document.querySelector("#TTiketcase_keterangan").value =
                  data.RFO_details;
              }
              if (
                document.querySelector("#TTiketcase_improve").value.length === 0
              ) {
                document.querySelector("#TTiketcase_improve").value =
                  data.RFO_details;
              }
            }
            else if (
              document.querySelector("#TTiketcase_ownerGgn").options[2]
              .selected ||
              document.querySelector("#TTiketcase_ownerGgn").options[1].selected
            ) {
              // gamas or force major
              document.querySelector("#TTiketcase_dateClose").value =
                data.dateClosed;
              document.querySelector("#TTiketcase_starttime").value = dateOpen;
              document.querySelector("#TTiketcase_endtime").value =
                data.dateClosed;
              if (
                document.querySelector("#TTiketcase_improve").value.length === 0
              ) {
                document.querySelector("#TTiketcase_improve").value =
                  data.RFO_details;
              }
              document.querySelector("#TTiketcase_keterangan").value =
                data.RFO_details + "\n" + initRFO;
            }
            else {
              document.querySelector("#TTiketcase_dateClose").value =
                data.dateClosed;
              document.querySelector("#TTiketcase_starttime").value = dateOpen;
              document.querySelector("#TTiketcase_endtime").value =
                data.dateClosed;
              document.querySelector("#TTiketcase_keterangan").value =
                data.RFO_details + "\n" + initRFO;
              document.querySelector("#TTiketcase_improve").value =
                data.RFO_details;
            }
            document
              .querySelectorAll("a.search-button.btn.btn-info")[1]
              .click();
            setTimeout(() => {
              document
                .querySelectorAll("div.modal-body")[1]
                .querySelectorAll("input")[1].value = ""; //rfo(actualSolution)
              document
                .querySelectorAll("div.modal-body")[1]
                .querySelectorAll("input")[1]
                .focus();
              document
                .querySelectorAll("div.modal-body")[1]
                .querySelectorAll("input")[1]
                .select();
            }, 1000);
          },
        };
        GM_xmlhttpRequest(details);
      }
    });
  }

  function updateWorkLogs(jNode) {
    var finalData = ``;
    jNode.after("<button type='button' style='margin-left: 10px;' class='button-value btn btn-success' id='update-wl'>update-wl</button>");
    $("#update-wl").on("click", () => {
      const query = $("#TTiketcase_faultnb").val();
      const details = {
        method: "GET",
         url:`https://cso-2025-fe71e-default-rtdb.asia-southeast1.firebasedatabase.app/data/tickets/${query}/worklogs.json`,
        //url: `https://autofill-2u8b.onrender.com/update-worklogs?ticketId=${query}`,
        // url: `http://localhost:3000/update-worklogs?ticketId=${query}`,
        // url: `https://autofill.faizruzain.site/update-worklogs?ticketId=${query}`,
        responseType: "json",
        onload: (res) => {
          console.log(res);
          const data = res.response
          if (data) {
            for (var i = 0; i < data.length; i++) {
              finalData += `${data[i]}\n`;
            }
            jNode.val(finalData);

          }
        }
      }
      GM_xmlhttpRequest(details);
    });
  }

  waitForKeyElements("#TTiketcase_faultnb", autoFill);
  waitForKeyElements("#TTiketcase_dateClose", paste);
  waitForKeyElements("#TTiketcase_impact", impactNum);
  waitForKeyElements("#TTiketcase_statusTiket", close);
  waitForKeyElements("#TTiketcase_keterangan", updateWorkLogs);

})();
