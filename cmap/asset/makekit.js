$(() => { // jQuery onReady callback
  let app = MakeKitApp.instance()
})

CDM = {};
CDM.cmap = null;
CDM.kit = null;
CDM.option = {};

// console.error(CDM);
class MakeKitApp {
  constructor() {
    this.kbui = KitBuildUI.instance(MakeKitApp.canvasId)
    this.kitMap = null;
    this.conceptMap = null;

    let canvas = this.kbui.canvases.get(MakeKitApp.canvasId)
    canvas.addToolbarTool(KitBuildToolbar.UNDO_REDO, { priority: 3 })
    canvas.addToolbarTool(KitBuildToolbar.CAMERA, { priority: 4 })
    canvas.addToolbarTool(KitBuildToolbar.UTILITY, { priority: 5, trash: false })
    canvas.addToolbarTool(KitBuildToolbar.LAYOUT, { stack: 'right' })

    canvas.toolbar.render()
    canvas.addCanvasTool(KitBuildCanvasTool.CENTROID)
    canvas.addCanvasTool(KitBuildCanvasTool.DISCONNECT)
    canvas.addCanvasTool(KitBuildCanvasTool.LOCK)
    canvas.addCanvasMultiTool(KitBuildCanvasTool.LOCK)
    canvas.addCanvasMultiTool(KitBuildCanvasTool.UNLOCK)

    this.canvas = canvas;
    this.session = Core.instance().session();
    this.ajax = Core.instance().ajax();
    // Enable tooltip
    $('[data-bs-toggle="tooltip"]').tooltip({ html: true }) 

    this.handleEvent();
    this.handleRefresh();
  }

  static instance() {
    MakeKitApp.inst = new MakeKitApp();
    return MakeKitApp.inst;
  }

  setConceptMap(conceptMap) { // console.warn("CONCEPT MAP SET:", conceptMap, this)
    this.conceptMap = conceptMap
    if (conceptMap) {
      this.canvas.direction = conceptMap.map.direction;
      let status = `<span class="mx-2 d-flex align-items-center status-cmap">`
        + `<span class="badge rounded-pill bg-secondary">ID: ${conceptMap.map.cmid}</span>`
        + `<span class="text-secondary ms-2 text-truncate"><small>${conceptMap.map.title}</small></span>`
        + `</span>`
      StatusBar.instance().remove('.status-cmap').prepend(status);
    } else {
      StatusBar.instance().remove('.status-cmap');
    }
  }

  handleEvent() {

    let exportDialog = UI.modal("#concept-map-export-dialog", {
      hideElement: ".bt-cancel",
    });

    let importDialog = UI.modal("#concept-map-import-dialog", {
      hideElement: ".bt-cancel",
    });

    let optionDialog = UI.modal('#kit-option-dialog', {
      hideElement: '.bt-cancel',
      width: '750px',
      onShow: () => { 

        let kitMapOptions = CDM.option;
        if (!kitMapOptions) {
          optionDialog.setDefault()
          return
        }
  
        let feedbacklevel = $('#kit-option-dialog select[name="feedbacklevel"]')
        let feedbackleveldefault = $('#kit-option-dialog select[name="feedbacklevel"] option.default')
        let fullfeedback = $('#kit-option-dialog input[name="fullfeedback"]')
        let modification = $('#kit-option-dialog input[name="modification"]')
        let readcontent = $('#kit-option-dialog input[name="readcontent"]')
        let saveload = $('#kit-option-dialog input[name="saveload"]')
        let reset = $('#kit-option-dialog input[name="reset"]')
        let feedbacksave = $('#kit-option-dialog input[name="feedbacksave"]')
        let countfb = $('#kit-option-dialog input[name="countfb"]')
        let countsubmit = $('#kit-option-dialog input[name="countsubmit"]')
        let log = $('#kit-option-dialog input[name="log"]')
  
        if (kitMapOptions.feedbacklevel) feedbacklevel.val(kitMapOptions.feedbacklevel).change()
        else feedbackleveldefault.prop('selected', true)
  
        if (typeof kitMapOptions.fullfeedback != 'undefined')
          fullfeedback.prop('checked', parseInt(kitMapOptions.fullfeedback) == 1 ? true : false)
        else fullfeedback.prop('checked', true)
  
        if (typeof kitMapOptions.modification != 'undefined')
        modification.prop('checked', parseInt(kitMapOptions.modification) == 1 ? true : false)
        else modification.prop('checked', true)
  
        if (typeof kitMapOptions.readcontent != 'undefined')
        readcontent.prop('checked', parseInt(kitMapOptions.readcontent) == 1 ? true : false)
        else readcontent.prop('checked', true)
  
        if (typeof kitMapOptions.saveload != 'undefined')
        saveload.prop('checked', parseInt(kitMapOptions.saveload) == 1 ? true : false)
        else saveload.prop('checked', true)
  
        if (typeof kitMapOptions.reset != 'undefined')
        reset.prop('checked', parseInt(kitMapOptions.reset) == 1 ? true : false)
        else reset.prop('checked', true)
        
        if (typeof kitMapOptions.feedbacksave != 'undefined')
        feedbacksave.prop('checked', parseInt(kitMapOptions.feedbacksave) == 1 ? true : false)
        else feedbacksave.prop('checked', true)

        if (typeof kitMapOptions.countfb != 'undefined')
        countfb.prop('checked', parseInt(kitMapOptions.countfb) == 1 ? true : false)
        else countfb.prop('checked', true);

        if (typeof kitMapOptions.countsubmit != 'undefined')
        countsubmit.prop('checked', parseInt(kitMapOptions.countsubmit) == 1 ? true : false)
        else countsubmit.prop('checked', true);
  
        if (typeof kitMapOptions.log != 'undefined')
        log.prop('checked', parseInt(kitMapOptions.log) == 1 ? true : false)
        else log.prop('checked', false)
      }
    })
    optionDialog.setDefault = () => {
      let feedbackleveldefault = $('#kit-option-dialog select[name="feedbacklevel"] option.default')
      let fullfeedback = $('#kit-option-dialog input[name="fullfeedback"]')
      let modification = $('#kit-option-dialog input[name="modification"]')
      let readcontent = $('#kit-option-dialog input[name="readcontent"]')
      let saveload = $('#kit-option-dialog input[name="saveload"]')
      let reset = $('#kit-option-dialog input[name="reset"]')
      let feedbacksave = $('#kit-option-dialog input[name="feedbacksave"]')
      let countfb = $('#kit-option-dialog input[name="countfb"]');
      let countsubmit = $('#kit-option-dialog input[name="countsubmit"]');
      let log = $('#kit-option-dialog input[name="log"]')
  
      feedbackleveldefault.prop('selected', true)
      fullfeedback.prop('checked', true)
      modification.prop('checked', true)
      readcontent.prop('checked', true)
      saveload.prop('checked', true)
      reset.prop('checked', true)
      feedbacksave.prop('checked', true)
      countfb.prop('checked', true);
      countsubmit.prop('checked', true);
      log.prop('checked', false)
    }
    optionDialog.enableAll = () => {
      let feedbacklevel = $('#kit-option-dialog select[name="feedbacklevel"]')
      let fullfeedback = $('#kit-option-dialog input[name="fullfeedback"]')
      let modification = $('#kit-option-dialog input[name="modification"]')
      let readcontent = $('#kit-option-dialog input[name="readcontent"]')
      let saveload = $('#kit-option-dialog input[name="saveload"]')
      let reset = $('#kit-option-dialog input[name="reset"]')
      let feedbacksave = $('#kit-option-dialog input[name="feedbacksave"]')
      let countfb = $('#kit-option-dialog input[name="countfb"]');
      let countsubmit = $('#kit-option-dialog input[name="countsubmit"]');
      let log = $('#kit-option-dialog input[name="log"]')
  
      feedbacklevel.val(3).change()
      fullfeedback.prop('checked', true)
      modification.prop('checked', true)
      readcontent.prop('checked', true)
      saveload.prop('checked', true)
      reset.prop('checked', true)
      feedbacksave.prop('checked', true)
      countfb.prop('checked', true);
      countsubmit.prop('checked', true);
      log.prop('checked', true)
    }
    optionDialog.disableAll = () => {
      let feedbacklevel = $('#kit-option-dialog select[name="feedbacklevel"]')
      let fullfeedback = $('#kit-option-dialog input[name="fullfeedback"]')
      let modification = $('#kit-option-dialog input[name="modification"]')
      let readcontent = $('#kit-option-dialog input[name="readcontent"]')
      let saveload = $('#kit-option-dialog input[name="saveload"]')
      let reset = $('#kit-option-dialog input[name="reset"]')
      let feedbacksave = $('#kit-option-dialog input[name="feedbacksave"]')
      let countfb = $('#kit-option-dialog input[name="countfb"]');
      let countsubmit = $('#kit-option-dialog input[name="countsubmit"]');
      let log = $('#kit-option-dialog input[name="log"]')
  
      feedbacklevel.val(0).change()
      fullfeedback.prop('checked', false)
      modification.prop('checked', false)
      readcontent.prop('checked', false)
      saveload.prop('checked', false)
      reset.prop('checked', false)
      feedbacksave.prop('checked', false)
      countfb.prop('checked', false);
      countsubmit.prop('checked', false);
      log.prop('checked', false)
    }

    /**
     *
     * Export
     * 
     **/

    $(".app-navbar .bt-export").on("click", (e) => {
      // console.log(this.conceptMap);
      // remove visual styles and unselect before saving...
      this.canvas.cy.elements().removeClass('select').unselect();
      let kitdata = {};
      kitdata.canvas = KitBuildUI.buildConceptMapData(this.canvas);
      kitdata.map = {
        layout: 'preset',
        options: CDM.option,
        enabled: true,
        cmid: this.conceptMap.map.cmid ? this.conceptMap.map.cmid : null,
      };
      // clean image data of kit
      kitdata.canvas.concepts.forEach(c => {
        let d = JSON.parse(c.data);
        delete d.image;
        c.data = JSON.stringify(d);
      });
      // console.log(this.conceptMap, kitdata);
      // api.saveKit(kitdata);
      $("#concept-map-export-dialog .encoded-data").val(
        `conceptMap=${Core.compress(this.conceptMap)}\r\nkit=${Core.compress(kitdata)}\r\n`
      );
      exportDialog.show();
    });

    $("#concept-map-export-dialog").on("click", ".bt-clipboard", (e) => {
      navigator.clipboard.writeText(
        $("#concept-map-export-dialog .encoded-data").val().trim()
      );
      $(e.currentTarget).html(
        '<i class="bi bi-clipboard"></i> Data has been copied to Clipboard!'
      );
      setTimeout(() => {
        $(e.currentTarget).html(
          '<i class="bi bi-clipboard"></i> Copy to Clipboard'
        );
      }, 3000);
    });

    /**
     *  
     * Import
     *
     **/  

    $(".app-navbar .bt-import").on("click", (e) => {
      importDialog.show();
    });

    $("#concept-map-import-dialog").on("click", ".bt-paste", async (e) => {
      let encoded = await navigator.clipboard.readText();
      $('#concept-map-import-dialog .encoded-data').val(encoded);
    });

    $('#concept-map-import-dialog').on("click", ".bt-decode", async (e) => {
      let data = $('#concept-map-import-dialog .encoded-data').val().trim();
      try {
        data = MakeKitApp.parseIni(data);
        let conceptMap = Core.decompress(data.conceptMap.replaceAll('"',''));
        if (data === undefined) {
          this.showConceptMap(conceptMap);
          return;
        }
        let kit = Core.decompress(data.kit.replaceAll('"',''));
        kit.canvas.conceptMap = this.conceptMap.canvas;
        let cyData = KitBuildUI.composeKitMap(kit.canvas);
        this.canvas.cy.elements().remove();
        this.canvas.cy.add(cyData);
        this.canvas.applyElementStyle()
        this.canvas.toolbar.tools.get(KitBuildToolbar.CAMERA).fit(null, {duration: 0})
        KitBuildUI.showBackgroundImage(this.canvas);
        CDM.option = kit.map.options;
        importDialog.hide();
      } catch(e) {
        UI.errorDialog("Invalid import data.").show();
      }     
    });
  
    /** 
     * 
     * Set Options for Kit
     * 
     **/
    
    $('.app-navbar .bt-option').on('click', () => {
      optionDialog.show();
    });
  
    $('#kit-option-dialog').on('click', '.bt-enable-all', (e) => {
      optionDialog.enableAll()
    })
  
    $('#kit-option-dialog').on('click', '.bt-disable-all', (e) => {
      optionDialog.disableAll()
    })
    
    $('#kit-option-dialog').on('click', '.bt-default', (e) => {
      optionDialog.setDefault()
    })
  
    $('#kit-option-dialog').on('click', '.bt-apply', (e) => {
      let option = {
        feedbacklevel: $('#kit-option-dialog select[name="feedbacklevel"]').val(),
        fullfeedback: $('#kit-option-dialog input[name="fullfeedback"]').prop('checked') ? 1 : 0,
        modification: $('#kit-option-dialog input[name="modification"]').prop('checked') ? 1 : 0,
        readcontent: $('#kit-option-dialog input[name="readcontent"]').prop('checked') ? 1 : 0,
        saveload: $('#kit-option-dialog input[name="saveload"]').prop('checked') ? 1 : 0,
        reset: $('#kit-option-dialog input[name="reset"]').prop('checked') ? 1 : 0,
        feedbacksave: $('#kit-option-dialog input[name="feedbacksave"]').prop('checked') ? 1 : 0,
        countfb: $('#kit-option-dialog input[name="countfb"]').prop('checked') ? 1 : 0,
        countsubmit: $('#kit-option-dialog input[name="countsubmit"]').prop('checked') ? 1 : 0,
        log: $('#kit-option-dialog input[name="log"]').prop('checked') ? 1 : 0,
      }
  
      // only store information, when it is not default
      if (option.feedbacklevel == 2) delete option.feedbacklevel;
      if (option.fullfeedback) delete option.fullfeedback;
      if (option.modification) delete option.modification;
      if (option.readcontent) delete option.readcontent;
      if (option.saveload) delete option.saveload;
      if (option.reset) delete option.reset;
      if (option.feedbacksave) delete option.feedbacksave;
      if (option.countfb) delete option.countfb;
      if (option.countsubmit) delete option.countsubmit;
      if (!option.log) delete option.log;

      CDM.option = option;
      UI.success("Kit options applied.").show();
      optionDialog.hide();
  
    })
  
    /**
     * 
     * Save/Save As Kit
     *
     **/
  
    $('.app-navbar .bt-save').on('click', (e) => { // console.log(MakeKitApp.inst)
      e.preventDefault();
      // remove visual styles and unselect before saving...
      this.canvas.cy.elements().removeClass('select').unselect();
      let kitdata = {};
      kitdata.canvas = KitBuildUI.buildConceptMapData(this.canvas);
      kitdata.map = {
        layout: 'preset',
        options: CDM.option,
        enabled: true,
        cmid: this.conceptMap.map.cmid ? this.conceptMap.map.cmid : null,
      };
      // clean image data of kit
      kitdata.canvas.concepts.forEach(c => {
        let d = JSON.parse(c.data);
        delete d.image;
        c.data = JSON.stringify(d);
      });
      // console.log(this.conceptMap, kitdata);
      api.saveKit(kitdata);
    });
    
    $('.app-navbar .bt-save-as').on('click', (e) => { // console.log(MakeKitApp.inst)
      e.preventDefault();
      UI.confirm("Save this concept map kit as another file?")
        .positive(async () => {
          // remove visual styles and unselect before saving...
          this.canvas.cy.elements().removeClass('select').unselect();
          let kitdata = {};
          kitdata.canvas = KitBuildUI.buildConceptMapData(this.canvas);
          kitdata.map = {
            layout: 'preset',
            options: CDM.option,
            enabled: true,
            cmid: this.conceptMap.map.cmid ? this.conceptMap.map.cmid : null,
          };
          // clean image data of kit
          kitdata.canvas.concepts.forEach(c => {
            let d = JSON.parse(c.data);
            delete d.image;
            c.data = JSON.stringify(d);
          });
          // console.log(this.conceptMap, kitdata);
          let result = await api.saveKitAs(kitdata);
          // console.log(result);
          if (result.conceptMap)
            this.conceptMap = Core.decompress(result.conceptMap);
          else if(!result.result) UI.warning('Save as is cancelled.').show();
          // console.error(this);
        })
        .show();
    });
  
    /**
     *  
     * Kit Edges Modification Tools
     *
     **/ 
  
    $('.app-navbar .bt-toggle-right').on('click', () => {
      if (!this.conceptMap) return
      if (this.canvas.cy.edges('[type="right"]').length)
      this.canvas.cy.edges('[type="right"]').remove();
      else {
        // console.log(this.conceptMap);
        this.conceptMap.canvas.linktargets.forEach(linktarget => {
          this.canvas.cy.add({
            group: "edges",
            data: JSON.parse(linktarget.target_data)
          })
        });
      }
      this.canvas.canvasTool.clearCanvas().clearIndicatorCanvas()
    });
  
    $('.app-navbar .bt-toggle-left').on('click', () => {
      if (!this.conceptMap) return
      if (this.canvas.cy.edges('[type="left"]').length)
      this.canvas.cy.edges('[type="left"]').remove();
      else {
        this.conceptMap.canvas.links.forEach(link => {
          if (!link.source_cid) return
          this.canvas.cy.add({
            group: "edges",
            data: JSON.parse(link.source_data)
          })
        });
      }
      this.canvas.canvasTool.clearCanvas().clearIndicatorCanvas()
    });
  
    $('.app-navbar .bt-remove').on('click', () => {
      if (!this.conceptMap) return
      if (this.canvas.cy.edges().length) this.canvas.cy.edges().remove();
      this.canvas.canvasTool.clearCanvas().clearIndicatorCanvas()
    });
  
    $('.app-navbar .bt-restore').on('click', () => {
      if (!this.conceptMap) return
      this.canvas.cy.edges().remove();
      this.conceptMap.canvas.links.forEach(link => {
        if (!link.source_cid) return
        this.canvas.cy.add({
          group: "edges",
          data: JSON.parse(link.source_data)
        })
      });
      this.conceptMap.canvas.linktargets.forEach(linktarget => {
        this.canvas.cy.add({
          group: "edges",
          data: JSON.parse(linktarget.target_data)
        })
      });
      this.canvas.canvasTool.clearCanvas().clearIndicatorCanvas()
    });
  
    $('.app-navbar .bt-reset').on('click', () => {
      if (!this.conceptMap) return
      let confirm = UI.confirm("Do you want to reset the map to goalmap settings?").positive(() => {
        // console.log(this.conceptMap);
        this.canvas.cy.elements().remove()
        this.canvas.cy.add(KitBuildUI.composeConceptMap(this.conceptMap.canvas))
        this.canvas.applyElementStyle()
        this.canvas.toolbar.tools.get(KitBuildToolbar.CAMERA).fit(null, {duration: 0})
        this.canvas.canvasTool.clearCanvas().clearIndicatorCanvas();
        KitBuildUI.showBackgroundImage(this.canvas);
        confirm.hide()
        UI.info("Kit has been reset to goalmap settings.").show()
      }).show()
    });

    /**
     * 
     * Electron API
     * 
     **/

    api.loadConceptMapResult((event, data) => {
      // console.warn(event, data);
      this.conceptMap = Core.decompress(data);
    });

    api.saveKitResult((event, data, d) => {
      // console.warn(event, data, d);
      UI.dialog('Kit has been saved.').show();
    });

    api.loadKitResult((event, data) => {
      // console.warn(event, data);
      if (data === undefined) {
        this.showConceptMap(this.conceptMap);
        return;
      }
      let kit = Core.decompress(data);
      kit.canvas.conceptMap = this.conceptMap.canvas;
      // console.warn(kit);
      let cyData = KitBuildUI.composeKitMap(kit.canvas);
      this.canvas.cy.elements().remove();
      this.canvas.cy.add(cyData);
      this.canvas.applyElementStyle();
      this.canvas.toolbar.tools.get(KitBuildToolbar.CAMERA).fit(null, {duration: 0});
      KitBuildUI.showBackgroundImage(this.canvas);
      CDM.option = kit.map.options;
    });
  
  }
  
  /**
   * 
   * Handle refresh web browser
   */
  
  handleRefresh() {
    api.loadConceptMap();
    api.loadKit();
  }

  showConceptMap(data) {
    let cyData = KitBuildUI.composeConceptMap(data.canvas);
    this.setConceptMap(data);
    this.canvas.cy.elements().remove();
    this.canvas.cy.add(cyData);
    this.canvas.applyElementStyle();
    this.canvas.toolbar.tools
      .get(KitBuildToolbar.CAMERA)
      .fit(null, { duration: 0 });
    this.canvas.canvasTool.clearCanvas().clearIndicatorCanvas();
    UI.success("Concept map loaded.").show();
  }

}

MakeKitApp.parseIni = (data) => {
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

MakeKitApp.canvasId = "makekit-canvas"
MakeKitApp.buildKitSets = (kitSet, canvas) => {
  if (kitSet) {
    // console.warn(kitSet);
    let partsMap = new Map();
    kitSet.sets.forEach(set => {
      let setid = parseInt(set.setid);
      let part = {
        id: setid,
        elements: new Map(),
        concepts: new Map(),
        links: new Map(),
        edges: new Map()
      };
      kitSet.concepts.forEach(c => {
        if (parseInt(c.setid) == setid) {
          let el = canvas.cy.elements(`#${c.cid}`);
          part.elements.set(el.id(), el);
          part.concepts.set(el.id(), el);
        }
      });
      kitSet.links.forEach(l => {
        if (parseInt(l.setid) == setid) {
          let el = canvas.cy.elements(`#${l.lid}`);
          part.elements.set(el.id(), el);
          part.links.set(el.id(), el);
        }
      });
      kitSet.sourceEdges.forEach(e => {
        if (parseInt(e.setid) == setid) {
          let el = canvas.cy.elements(`[source="${e.lid}"][target="${e.source_cid}"]`);
          part.elements.set(el.id(), el);
          part.edges.set(el.id(), el);
        }
      });
      kitSet.targetEdges.forEach(e => {
        if (parseInt(e.setid) == setid) {
          let el = canvas.cy.elements(`[source="${e.lid}"][target="${e.target_cid}"]`);
          part.elements.set(el.id(), el);
          part.edges.set(el.id(), el);
        }
      });
      partsMap.set(setid, part);
    });
    // console.warn(partsMap);
    let partitionTool = MakeKitApp.inst.canvas.toolbar.tools.get('partition');
    partitionTool.partsMap = partsMap;
    partitionTool.refreshPartList();

  }
}