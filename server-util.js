const VALID_ATTR_ARR = ['_id','name','address','type','serialNumber','phone','qrCode'];

module.exports.sitesOnChangeAutentication = (sitesOnChange) => {
    let res = [];
    for( site of sitesOnChange )
    {
      for( a of Object.keys(site.attr) )
      {
        if( VALID_ATTR_ARR.find( x => x === a ) === -1 ) {
          res.push(`error: in site ${site.id}, attribute ${a} is invalid`);
          delete site[attr].a;
        }
        if( a === 'name' && sites.attr.a === '') {
          res.push(`error: in site ${site.id}, deleting sites name is forbidden`);
          delete site[attr].a;
        }
      }
      return res;
    }
  }
  
module.exports.checkAndUpdateRespData = (dbConnectionRes, siteId, respData) => {
    if ( dbConnectionRes === 0 ) {
      const errStr = `error: in site ${siteId} database connection occured`;
      respData.attrErr.push(errStr)
    } else if ( dbConnectionRes.result.n === 0 ) {
      respData.idsNotFound.push(siteId);
    } else {
      respData.idsUpdated.push(siteId);
    }
  }
  