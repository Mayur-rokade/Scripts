/**
 *@NApiVersion 2.x
 *@NScriptType UserEventScript
 */

/**
 * Description: This script will use to Set the Shipping Method on Sales Order Record based on the specific customer selection.
 * version: 1.0.0 - initial version
 * author: GBS / Palavi Rajgude
 * date: 11-04-2021
 */

define(["N/record", "N/search", "N/runtime"], function(
    record,
    search,
    runtime
) {
    function afterSubmit(context) {
        var getScriptParameter = runtime.getCurrentScript();

        var searsId = getScriptParameter.getParameter({
            name: "custscript_gbs_scriptparam_searid",
        });

        var lowesId = getScriptParameter.getParameter({
            name: "custscript_gbs_scriptparam_loweid",
        });

        var lowesId2 = getScriptParameter.getParameter({
            name: "custscriptcustscript_gbs_scriptparam_low",
        });

        var amazonId = getScriptParameter.getParameter({
            name: "custscript_gbs_scriptparam_amazonid",
        });

        var ebayId = getScriptParameter.getParameter({
            name: "custscript_gbs_scriptparam_ebayid",
        });

        var currentObj = context.newRecord;

        var recordId = currentObj.id;

        var recordLoad = record.load({
            type: record.Type.SALES_ORDER,
            id: recordId,
            isdynamic: true,
        });

        var getCustomer = recordLoad.getValue({
            fieldId: "entity",
        });

        // log.debug("Customer Id", getCustomer);

        var customerRecordLoad = record.load({
            type: record.Type.CUSTOMER,
            id: getCustomer,
            isdynamic: true,
        });

        var getShopifyCustomer = customerRecordLoad.getValue({
            fieldId: "custentity_in8_shop_id",
        });
        //log.debug("shopify Customer Id", getShopifyCustomer);

        var getShippingMethod = recordLoad.getValue({
            fieldId: "shipmethod",
        });

        //log.debug("shipping method", getShippingMethod);

        if (
            getCustomer == lowesId ||
            getCustomer == lowesId2 ||
            getCustomer == searsId ||
            getCustomer == amazonId ||
            getCustomer == ebayId ||
            getShopifyCustomer != ""
        ) {
            var itemLineCount = recordLoad.getLineCount({
                sublistId: "item",
            });

            //log.debug("Line Count", itemLineCount);
            var count = 0;

            var QtyLine = 0;

            var totalWeightSO = 0;

            if (getShippingMethod == 557) {
                return;
            }

            for (i = 0; i < itemLineCount; i++) {
                var itemId = recordLoad.getSublistValue({
                    sublistId: "item",
                    fieldId: "item",
                    line: i,
                });

                //  log.debug("Items", itemId)

                var itemWeight = search.lookupFields({
                    type: search.Type.ITEM,
                    id: itemId,
                    columns: ["weight"],
                });

                // log.debug("Items weight", itemWeight)
                var itemWeightTotal = itemWeight.weight;
                // log.debug("Items total weight", itemWeightTotal)

                var qtyItem = recordLoad.getSublistValue({
                    sublistId: "item",
                    fieldId: "quantity",
                    line: i,
                });

                var multiplicationofweigth = qtyItem * itemWeightTotal;

                //  log.debug("Items weight & quantity multiplication", multiplicationofweigth)

                totalWeightSO = totalWeightSO + multiplicationofweigth;

                //log.debug("Items weight & quantity multiplication result for line", totalWeightSO)

                var getExcludedCheckbox = recordLoad.getSublistValue({
                    sublistId: "item",
                    fieldId: "custcol_gbs_checkbox_excludefromship",
                    line: i,
                });

                // log.debug("excluded checkbox", getExcludedCheckbox);

                var getTotalUnit = recordLoad.getSublistValue({
                    sublistId: "item",
                    fieldId: "quantity",
                    line: i,
                });

                if (getExcludedCheckbox == false) {
                    count++;
                }
            }
            // log.debug("excluded checkbox count", count);

            // log.debug("sales order total unit in pound", getTotalUnit);

            if (getCustomer == lowesId || getCustomer == lowesId2) {
                if (itemLineCount == count) {
                    if (totalWeightSO < 1) {
                        recordLoad.setValue({
                            fieldId: "shipmethod",
                            value: 546,
                        });
                    } else {
                        recordLoad.setValue({
                            fieldId: "shipmethod",
                            value: 550,
                        });
                    }
                } else {
                    if (totalWeightSO < 1) {
                        recordLoad.setValue({
                            fieldId: "shipmethod",
                            value: 546,
                        });
                    }
                }
            } else {
                if (totalWeightSO < 1) {
                    recordLoad.setValue({
                        fieldId: "shipmethod",
                        value: 546,
                    });
                }
            }

            recordLoad.save();
        }
    }

    return {
        afterSubmit: afterSubmit,
    };
});