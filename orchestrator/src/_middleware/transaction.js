"use strict";
const cluster = require("cluster");

const nodeId = "";
let previousID = 0;
let lastDuplicate = 0;

const getUniqueTxnId = () => {
  let currentID = Date.now();
  if (cluster.isWorker) {
    let prefix = nodeId + "" + cluster.worker.id;
    // total 4 digit reserved for combination of node id and worker id.Hence only 11 digit taken from timeStamp
    currentID = prefix + currentID.toString().slice(-11);
  } else {
    currentID = nodeId + "1" + currentID;
  }
  currentID = +currentID;
  if (currentID == previousID) {
    // this case comes only if there is more than 1 request on a millisecond
    currentID = +previousID + 10000000000; //increment 11th digit
    //console.log(previousID+" duplicated, corrected as:"+currentID);
    lastDuplicate = previousID;
  } else if (currentID == lastDuplicate) {
    // this case comes only if there is more than 2 requests on a millisecond
    currentID = +previousID + 10000000000; //increment 11th digit
    //console.log(lastDuplicate + " duplicated more than once,corrected as:" + currentID);
  }
  previousID = currentID;
  return +currentID;
};

const setStartTime = (req, res, next) => {
  try {
    req.startTime = new Date().getTime();
    res.header("startTime", req.startTime);
  } catch (error) {
    //ignore
  }
  next();
};

const setTxnId = (req, res, next) => {
  try {
    if (req.query.transactionid != null && !isNaN(req.query.transactionid)) {
      req.txnId = req.query.transactionid;
    } else {
      req.txnId = getUniqueTxnId();
    }
    res.header("txnId", req.txnId);
  } catch (error) {
    //ignore
  }
  next();
};

const setTenantId = (req, res, next) => {
  try {
    if (req.headers["tenant-id"]) {
      req.tenantId = req.headers["tenant-id"];
      res.header("tenant-id", req.tenantId);
    }
  } catch (error) {
    //ignore
  }
  next();
};

module.exports = {
  getUniqueTxnId,
  setStartTime,
  setTxnId,
  setTenantId
};
