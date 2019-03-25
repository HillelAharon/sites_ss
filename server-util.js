
module.exports.sitesOnChangeAutentication = (sitesOnChange) => {
    let res = [];
    for(let site of sitesOnChange )
    {
      for(let a of Object.keys(site.attr) )
      {
        if( VALID_ATTR_ARR.find( x => x === a ) === -1 ) {
          res.push(`error: in site ${site.id}, attribute ${a} is invalid`);
          delete site[attr].a;
        }
        if( a === 'name' && site.attr.a === '') {
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
  