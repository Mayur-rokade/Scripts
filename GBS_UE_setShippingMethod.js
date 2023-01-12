/**
 *@NApiVersion 2.1
 *@NScriptType UserEventScript
 */

/**
 * Description: This script will use to Set the Shipping Method on Sales Order Record based on the specific customer selection
 *
 * version: 1.0.0 - initial version
 * author: GBS / Palavi Rajgude
 * date: 11-04-2021
 */

define(["N/record", "N/search", "N/currentRecord", "N/runtime","N/email"], function (
    record,
    search,
    currentRecord,
    runtime,
    email
  ) {
    function afterSubmit(context) {
      var { lowesId, searsId, amazonId, ebayId ,secondDay, expidated, standardId, cartroverId} = getParameters();
  
      var recordLoad = record.load({
        type: record.Type.SALES_ORDER,
        id: context.newRecord.id
      });
  
      var getCustomer = recordLoad.getValue({
        fieldId: "entity"
      });
      
  
      var getShopifyCust = recordLoad.getValue({
        fieldId: "custbody11"
      });
  
      var getShipService = recordLoad.getValue({
          fieldId: "custbody12"
        });
  
      // log.debug("getShopifyCust", getShopifyCust);
  
      // var customerRecordLoad = record.load({
      //     type: record.Type.CUSTOMER,
      //     id: getCustomer,
      //     isdynamic: true,
      // });
  
      var getShopifyCustomer = recordLoad.getValue({
          fieldId: "custbody_in8_shop_source",
      });
      //log.debug("shopify Customer Id", getShopifyCustomer);
  
      var getShippingMethod = recordLoad.getValue({
        fieldId: "shipmethod"
      });
  
      //log.debug("shipping method", getShippingMethod);
  
      if (getShippingMethod == 557) {
        return;
      }
  
      if (
        getCustomer == lowesId ||
        getCustomer == searsId ||
        getCustomer == amazonId ||
        getCustomer == ebayId ||
       // getShopifyCust != "" ||
        getShopifyCustomer != ""
      ) {
  
        //log.debug("Customer Id", getCustomer);
        //log.debug("context.newRecord.id", context.newRecord.id);
  
        var itemLineCount = recordLoad.getLineCount({
          sublistId: "item"
        });
        //log.debug("Line Count", itemLineCount);
  
        var count = 0;
        var totalWeightSO = 0;
  
        for (i = 0; i < itemLineCount; i++) {
          var itemId = recordLoad.getSublistValue({
            sublistId: "item",
            fieldId: "item",
            line: i
          });
          //  log.debug("Items", itemId)
  
          var itemWeight = search.lookupFields({
            type: search.Type.ITEM,
            id: itemId,
            columns: ["weight"]
          });
          //log.debug("Items weight", itemWeight);
  
          var itemWeightTotal = itemWeight.weight ? parseFloat(itemWeight.weight): '';
  
          //log.debug("Items total weight", itemWeightTotal)
          //log.debug("Items weight", (!itemWeightTotal))
          var getExcludedCheckbox = recordLoad.getSublistValue({
            sublistId: "item",
            fieldId: "custcol_gbs_checkbox_excludefromship",
            line: i
          });
           //log.debug("excluded checkbox", getExcludedCheckbox);
  
          if (getExcludedCheckbox == false) {
            count++;
          }
  
          if (itemWeightTotal == "") {
            continue;
          } else {
            var qtyItem = recordLoad.getSublistValue({
              sublistId: "item",
              fieldId: "quantity",
              line: i
            });
            //log.debug("qtyItem", qtyItem);
            //log.debug("itemWeightTotal", itemWeightTotal);
  
            var multiplicationofweigth = qtyItem * itemWeightTotal;
            //log.debug("Items weight & quantity multiplication", multiplicationofweigth)
  
            totalWeightSO = totalWeightSO + multiplicationofweigth;
            //log.debug("Items weight & quantity multiplication result for line", totalWeightSO)
          }
  
        
        }
  
         log.debug("excluded checkbox count", count);
        // log.debug("itemWeightTotal outside for loop", itemWeightTotal);
         log.debug("totalWeightSO outside for loop", `totalWeightSO : ${totalWeightSO} for customer ${getCustomer} for SO ${context.newRecord.id}`);
        // log.debug("sales order total unit in pound", getTotalUnit);
         log.debug("totalWeightSO < 1", totalWeightSO < 1);
         log.debug("totalWeightSO > 1", totalWeightSO > 1);
         log.debug("itemLineCount == count", itemLineCount == count);
  
        
  
        if (getCustomer == lowesId) {
          if (itemLineCount == count) {
            if (!totalWeightSO) {
              return true;
            } else if (totalWeightSO < 1) {
              recordLoad.setValue({
                fieldId: "shipmethod",
                value: 546
              });
            } else {
              recordLoad.setValue({
                fieldId: "shipmethod",
                value: 550
              });
            }
          } 
        } else {
          if (!totalWeightSO) {
            return true;
          } else if (totalWeightSO < 1) {
            recordLoad.setValue({
              fieldId: "shipmethod",
              value: 546
            });
          } else {
            recordLoad.setValue({
              fieldId: "shipmethod",
              value: 550
            });
          }
        }
  
       
  
  
        
  
        // email.send({
        //   author: "2362",
        //   body: "Shipping method for so " + context.newRecord.id + " with customer " + recordLoad.getText({
        //       fieldId: "entity"
        //     }) + ' ' + recordLoad.getValue({
        //       fieldId: "shipmethod"
        //     }) +` for total weight ${totalWeightSO} `,
        //   recipients: "palavi.rajgude@theblueflamelabs.com",
        //   subject: "Your Sales Order has been shipping adddress " + context.newRecord.id
        // });
  
       
      }
      if(getCustomer == cartroverId){
  
        if(getShipService == secondDay){
          recordLoad.setValue({
              fieldId: "shipmethod",
              value: 557
            });
        }else if(getShipService == expidated){
  
              recordLoad.setValue({
              fieldId: "shipmethod",
              value: 547
            });
        }
        if(getShipService == standardId){
          return;
        }
  
      }
  
      recordLoad.save();
      
    }
  
    return {
      afterSubmit: afterSubmit
    };
  
    function getParameters() {
      var getScriptParameter = runtime.getCurrentScript();
  
      var searsId = getScriptParameter.getParameter({
        name: "custscript_gbs_scriptparam_searid"
      });
  
      var lowesId = getScriptParameter.getParameter({
        name: "custscript_gbs_scriptparam_loweid"
      });
  
  
      var amazonId = getScriptParameter.getParameter({
        name: "custscript_gbs_scriptparam_amazonid"
      });
  
      var ebayId = getScriptParameter.getParameter({
        name: "custscript_gbs_scriptparam_ebayid"
      });
  
      var secondDay=getScriptParameter.getParameter({
          name: "custscript_gbs_shipservice_second_day"
        });
  
      var expidated=getScriptParameter.getParameter({
          name: "custscript_gbs_shipservice_expidated"
        });
  
        var standardId=getScriptParameter.getParameter({
          name: "custscript_gbs_standard_ship_id"
        })
  
        var cartroverId = getScriptParameter.getParameter({
          name: "custscript_gbs_cartrover_id"
        });
    
  
      return { lowesId, searsId, amazonId, ebayId ,secondDay, expidated, standardId,cartroverId};
    }
  });