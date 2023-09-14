$(() => {

  class Generator {
      
  }

  Generator.processContent = (f, content) => {
    let ct = Generator.parseIni(content);
    ct.conceptMap = ct.conceptMap ? ct.conceptMap.replace(/['"]+/g, '') : null;
    ct.kit = ct.kit ? ct.kit.replace(/['"]+/g, '') : null;
    let cmapvalid = false;
    let kitvalid = false;
    try {
      let cmap = Core.decompress(ct.conceptMap);
      cmapvalid = true;
    } catch (e) {}
    try {  
      let kit = Core.decompress(ct.kit);
      kitvalid = true;
    } catch (e) {}
    let row = `<div class="d-flex align-items-center m-2 item-cmap" data-filepath="${f.path}">`
      + `<span class="item-id bt-mapid btn btn-sm btn-primary ms-2" style="min-width:100px;">NO-ID</span>`
      + (cmapvalid ? "" : `<small class="text-danger ms-2"><i class="bi bi-exclamation-triangle"></i> Concept map data is Invalid.</small>`)
      + (kitvalid ? "" : `<small class="text-danger ms-2"><i class="bi bi-exclamation-triangle"></i> Concept map has no kit defined or kit data is Invalid.</small>`)
      + `<small class="ms-2 text-small text-sm">${f.path.length < 30 ? f.path : "..." + f.path.substring(f.path.length-30,f.path.length)}</small>`
      + `<code class="code ms-2">${content.substring(0, 30)}...</code>`
      + `<span class="btn bt-delete btn-sm btn-danger ms-2"><i class="bi bi-x-lg"></i></span>`
      + '</div>';
    $('#data-container').append(row);
  }

  Generator.parseIni = (data) => {
    var regex = {
      section: /^\s*\[\s*([^\]]*)\s*\]\s*$/,
      param: /^\s*([^=]+?)\s*=\s*(.*?)\s*$/,
      comment: /^\s*;.*$/
    };
    var value = {};
    var lines = data.split(/[\r\n]+/);
    var section = null;
    lines.forEach(function(line){
      if(regex.comment.test(line)){
        return;
      }else if(regex.param.test(line)){
        var match = line.match(regex.param);
        if(section){
          value[section][match[1]] = match[2];
        }else{
          value[match[1]] = match[2];
        }
      }else if(regex.section.test(line)){
        var match = line.match(regex.section);
        value[match[1]] = {};
        section = match[1];
      }else if(line.length == 0 && section){
        section = null;
      };
    });
    return value;
  }

  let mapIdDialog = UI.modal('#mapid-dialog', {
    width: '400px',
    hideElement: ".bt-cancel",
    onShow: () => {
      $('#mapid-dialog .input-mapid').val('');
      setTimeout(() => {
        let mapid = mapIdDialog.button.html();
        // console.log(mapid);
        if (mapid == 'NO-ID') mapid = '';
        $('#mapid-dialog .input-mapid').val(mapid);
        $('#mapid-dialog .input-mapid').focus().select();
      }, 200);
      $('#mapid-dialog .input-mapid').off('keyup').on('keyup', (e) => {
        if(e.keyCode == 13) {
          let mapid = $('#mapid-dialog .input-mapid').val();
          if (mapid.trim().length == 0) mapid = 'NO-ID';
          mapIdDialog.button.html(mapid.trim());
          mapIdDialog.hide();
        }
      });
      $('#mapid-dialog .bt-ok').off('click').on('click', (e) => {
        let mapid = $('#mapid-dialog .input-mapid').val();
        if (mapid.trim().length == 0) mapid = 'NO-ID';
        mapIdDialog.button.html(mapid.trim());
        mapIdDialog.hide();
      })
    }
  });

  $('#data-container').on('click', '.bt-delete', (e) => {
    let itemCmap = $(e.currentTarget).parents('.item-cmap');
    itemCmap.fadeOut('fast', () => {
      itemCmap.remove();
    });
  });

  $('#data-container').on('click', '.bt-mapid', (e) => {
    mapIdDialog.button = $(e.currentTarget);
    mapIdDialog.show();
  });

  $('.bt-add-file').on('click', async (e) => {
    let filePath = await api.addFile();
    // console.log(filePath);
    if (filePath == undefined) return;
    let content = await api.readFile(filePath);
    Generator.processContent({
      path: filePath
    }, content);
    // console.log(content);
  });

  $('.bt-data-gen').on('click', (e) => {
    let valid = true;
    let invalidFile = null;
    let cmapFiles = [];
    let size = $('#data-container .item-cmap').length;
    let mapids = new Set();
    $('#data-container .item-cmap').each((index, element) => {
      let mapid = $(element).find('.bt-mapid').html().trim();
      let filepath = $(element).attr('data-filepath');
      if (mapid == 'NO-ID') {
        valid = false;
        invalidFile = filepath;
        return false;
      }
      if(mapids.has(mapid)) {
        UI.errorDialog(`Duplicate map ID: <code>${mapid}</code>`).show();
        return false;  
      }
      // console.log(mapid, filepath);
      cmapFiles.push({
        mapid: mapid,
        filepath: filepath
      });
      mapids.add(mapid);
    });
    if (!valid) {
      UI.errorDialog(`ID for file: ${invalidFile} is invalid.<br>Please set the ID.`).show();
      return;
    }
    // console.warn(cmapFiles);
    api.generateConceptMapData(cmapFiles).then(result => {
      if (result) {
        UI.successDialog(`Concept map data generated to file:<br><code>${result.filePath}</code>`).show();
        return;
      }
      UI.error(`An error occurred. Reason: ${result.reason}.`).show();
    });
  });

  document.addEventListener("drop", async (event) => {
    event.preventDefault();
    event.stopPropagation();

    for (const f of event.dataTransfer.files) {
      // Using the path attribute to get absolute file path
      console.log("File Path of dragged files: ", f.path);
      let content = await api.readFile(f.path);
      // console.log(content);
      Generator.processContent(f, content);
    }
  });

  document.addEventListener("dragover", (e) => {
    e.preventDefault();
    e.stopPropagation();
  });

  document.addEventListener("dragenter", (event) => {
    console.log("File is in the Drop Space");
  });

  document.addEventListener("dragleave", (event) => {
    console.log("File has left the Drop Space");
  });


});
