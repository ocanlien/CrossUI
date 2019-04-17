xui.Class("xui.UI.FormLayout",["xui.UI","xui.absList"],{
    Initialize:function(){
        this.addTemplateKeys(['ITEM','HOLDER','SPREADER']);
    },
    Instance:{
    },
    Static:{
        // currently, use handsontable 6.2.2 as html table for form layout
        // will use simple template for small script size at runtime
        renderType:"handsontable",

        _CONTAINERKEY:"ITEM",
        _ITEMCONTAINER:1,
        _ACTIVEHANDLER:["KEY","HOLDER"],
        _NoProp : {"conLayoutColumns":1},
        _objectProp:{layoutData:1},
        Appearances:{
            KEY:{
                overflow:'hidden'
            },
            BOX:{
                position:'absolute',
                left:0,
                top:0,
                'z-index':1
            },
            POOL:{
                position:'absolute',
                left:'100%',
                top:'100%',
                width:0,
                height:0
            },
            ITEM: {
              "position": "relative"
            },
            // reset bg
            "KEY ITEM": {
              "position": "relative",
                background:"transparent"
            },
             "KEY .handsontable tr":{
                  background:"transparent"
              },

            "ITEM.xui-children-in-td":{
                padding:'0',
                margin:'0',
                border:'0'
            },
            // for handsontable solid grid lines
            ".handsontable.solidgridline td": {
              "border-right": "1px solid #444",
              "border-bottom": "1px solid #444"
            },
            ".handsontable.solidgridline tr:first-child td": {
                "border-top": "1px solid #444"
            },
            ".handsontable.solidgridline th:nth-child(2), .handsontable.solidgridline td:first-of-type, .handsontable.solidgridline .htNoFrame + th, .handsontable.solidgridline .htNoFrame + td": {
                "border-left": "1px solid #444"
            },
            ".handsontable.nogridline td": {
              "border-right": "1px solid transparent",
              "border-bottom": "1px solid transparent"
            },
            ".handsontable.nogridline tr:first-child td": {
                "border-top": "1px solid transparent"
            },
            ".handsontable.nogridline th:nth-child(2), .handsontable.nogridline td:first-of-type, .handsontable.nogridline .htNoFrame + th, .handsontable.nogridline .htNoFrame + td": {
                "border-left": "1px solid transparent"
            }
        },
        Templates:{
            tagName:'div',
            className:'{_className}',
            style:'{_style}',
            BOX:{
                tagName:'div'
            },
            POOL:{
                tagName:'div'
            }
        },
        Behaviors:{
            DroppableKeys:['ITEM'],
            PanelKeys:['ITEM'],
            HotKeyAllowed:false,
            ITEM:{}
        },
        DataModel:{
            tabindex:null,
            defaultFocus:null,
            disableClickEffect:null,
            disableHoverEffect:null,
            disableTips:null,
            disabled:null,
            renderer:null,
            selectable:null,
            tips:null,
            autoTips:null,
            overflow:null,
            items:{
                hidden:true
            },
            listKey:null,
            dragSortable:null,
            mode:{
                ini:'',
                listbox:['','design','write','read'],
                get:function(){
                    return this.$inDesign?'design':(this.properties.mode || 'read');
                },
                action:function(){
                    this.boxing().refresh();
                }
            },
            width:{
                $spaceunit:1,
                ini:'30em'
            },
            height:{
                $spaceunit:1,
                ini:'25em'
            },
            solidGridlines:{
                ini:true,
                action:function(value){
                    var cls = value ? "solidgridline" : this.boxing().getMode()=='design' ? "" : "nogridline",
                        node = this.getSubNode('BOX');
                    node.removeClass("solidgridline nogridline");
                    if(cls)node.addClass(cls);
                }
            },
            stretchH:{
                ini:"all",
                listbox:["","none","last","all"],
                action:function(){
                    this.box._updateSetting(this,'stretchH');
                }
            },
            rowHeaderWidth:{
                ini:25,
                action:function(){
                    this.box._updateSetting(this,'rowHeaderWidth');
                    var size=this.getRoot().cssSize();
                    xui.UI.$tryResize(this, size.width, size.height);
                }
            },
            columnHeaderHeight:{
                ini:25,
                action:function(){
                    this.box._updateSetting(this,'columnHeaderHeight');
                    var size=this.getRoot().cssSize();
                    xui.UI.$tryResize(this, size.width, size.height);
                }
            },
            defaultRowSize: 5,
            defaultColumnSize: 5,
            defaultRowHeight: 50,
            defaultColumnWidth: 50,

            // don't use handsometable's cell className - buggy (when moving row/column)
            // rows:5, cols:5, rowSetting:{'3':{}}, colSetting:{"B":{}}, cells:{A3:{type:"",value:"",,style:"",border:""}}, merged:[]
            layoutData:{
                ini:{},
                action:function(){
                    this.boxing().refresh();
                }
            },
            // if use handsontable 6.22 (MIT license) as renderer
            rendererCDNJS:"https://cdn.jsdelivr.net/npm/handsontable@6.2.2/dist/handsontable.full.min.js",
            rendererCDNCSS:"https://cdn.jsdelivr.net/npm/handsontable@6.2.2/dist/handsontable.full.min.css"
        },
        RenderTrigger:function(){
            var prf=this,prop=prf.properties,cls=prf.box;
            if(prf.box.renderType=="handsontable"){
                if(window.Handsontable)cls._renderAsHandsontable(prf);
                else{
                    // prf.boxing().busy(false, "Loading table ...");
                    var cssId="xui.UI.HTable:Handsontable";
                    xui.CSS.includeLink(prop.rendererCDNCSS,cssId);
                    xui.include("Handsontable",prop.rendererCDNJS,function(){
                        if(xui(cssId).get(0)){
                            //prf.boxing().free();
                            cls._renderAsHandsontable(prf);
                            var size=prf.getRoot().cssSize();
                            xui.UI.$tryResize(prf, size.width, size.height);
                        }else{
                            xui.Thread.repeat(function(){
                                if(xui(cssId).get(0)){
                                    //prf.boxing().free();
                                    cls._renderAsHandsontable(prf);
                                    var size=prf.getRoot().cssSize();
                                    xui.UI.$tryResize(prf, size.width, size.height);
                                    return false;
                                }
                            },200);
                        }
                    },null,false,{cache:true});
                }
            }
            // will be called in refresh()
            prf.$handleCustomVars=function(d){
                if(!d){
                    xui.arr.each(prf.children,function(c){
                        delete c[0]._attached2cell;
                        delete c[0]._autoexpand;
                    });
                }
            }
            prf.boxing().setSolidGridlines(prop.solidGridlines, true);
        },
        EventHandlers:{
            onShowTips:null
        },
        _getHeaderOffset:function(prf){
            var prop=prf.properties,
                  offset = {left:0,top:0};
            if(prf.box.renderType=="handsontable"){
                if(prf.boxing().getMode()=="design"){
                    offset.left=prop.rowHeaderWidth;
                    offset.top=prop.columnHeaderHeight + 1;
                }
               /*
                var node = prf.getSubNode("BOX");
                node.children().each(function(n){
                    if(xui(n).hasClass("ht_clone_top")){
                        offset.top = xui(n).first(2).height();
                    }else if(xui(n).hasClass("ht_clone_left")){
                        offset.left = xui(n).first(4).width();
                    }
                });
               */
            }
            return offset;
        },
        _layoutChanged:function(prf, force){
            if(force || prf._$tableInited)
                xui.resetRun(prf.getUid("layoutchanged"),function(){
                    //console.log("onLayoutChanged");
                    var oData = prf.properties.layoutData;
                    prf.properties.layoutData = prf.box._getLayoutData(prf);
                    if(prf.$onLayoutChanged)prf.$onLayoutChanged(prf, oData, prf.properties.layoutData);
                });
        },
        _getLayoutData:function(prf){
            var prop=prf.properties, 
                cells={}, borders, rowSetting={}, colSetting={}, merged=[],
                layoutData = {},
                data, rows, cols, t, p, s, tmp;

            // handsontable to xui
             if(prf.box.renderType=="handsontable" && (t = prf.$htable)){
                // rows:5, cols:5, merged:[]
                layoutData.rows = t.countRows();
                layoutData.cols = t.countCols();
                merged = xui.copy(xui.get(t.getPlugin("mergeCells"),["mergedCellsCollection","mergedCells"]));
                if(!xui.isEmpty(merged)) layoutData.merged=merged;

                s = t.getSettings();
                // rowSetting:{'3':{}}
                p = t.getPlugin("ManualRowResize");
                for(var i=0, l=layoutData.rows,h; i<l;i++){
                    var row=t.toPhysicalRow(i);
                    if(p.manualRowHeights && p.manualRowHeights[row]) xui.set(rowSetting, [i+1, 'manualHeight'], p.manualRowHeights[row]);
                    if(tmp = xui.isArr(s.rowHeights)?s.rowHeights[row]:s.rowHeights) xui.set(rowSetting, [i+1, 'height'], tmp);
                }
                if(!xui.isEmpty(rowSetting)) layoutData.rowSetting=rowSetting;

                // colSetting:{"B":{}}
                p = t.getPlugin("ManualColumnResize");
                for(var i=0, l=layoutData.cols,w; i<l;i++){
                    var col=t.toPhysicalColumn(i);
                    if(p.manualColumnWidths && p.manualColumnWidths[col]) xui.set(colSetting, [xui.ExcelFormula.toColumnChr(i+1), 'manualWidth'], p.manualColumnWidths[col]);
                    if(tmp = xui.isArr(s.colWidths)?s.colWidths[col]:s.colWidths) xui.set(colSetting, [xui.ExcelFormula.toColumnChr(i+1), 'width'], tmp);
                }
                if(!xui.isEmpty(colSetting)) layoutData.colSetting=colSetting;

                // cells:{A3:{type:"",value:"",style:"",border:""}
                data = t.getData();
                // cells:{A3:{value:"v"}
                for(var i=0,l=data.length;i<l;i++){
                    var row=data[i];
                    for(var m=0,n=row.length;m<n;m++){
                       // ignore null/undefined/""
                       if(xui.isSet(data[i][m]) && data[i][m]!==""){
                           xui.set(cells, [xui.ExcelFormula.toCellId(m,i), "value"], data[i][m]);
                       }
                    }
                }
                // cells:{A3:{style:{}}
                for(var i=0,l=layoutData.rows;i<l;i++){
                    var row=t.toPhysicalRow(i);
                    var rowMetas = t.getCellMetaAtRow(row);
                    for(var m=0,n=rowMetas.length;m<n;m++){
                        var col=t.toPhysicalColumn(m);
                        // align settings
                        // don't use className - buggy
//                        if(rowMetas[col].className)
//                            xui.set(cells, [xui.ExcelFormula.toCellId(m,i), "className"], xui.str.trim(rowMetas[col].className));
                        // style: ignore empty {}
                        if(!xui.isEmpty(rowMetas[col].style))
                            xui.set(cells, [xui.ExcelFormula.toCellId(m,i), "style"], xui.copy(rowMetas[col].style));
                    }
                }
                if(!xui.isEmpty(cells)) layoutData.cells=cells;

                var cbPlugin = t.getPlugin('customBorders');
                if((borders = cbPlugin.getBorders()).length){
                    layoutData.customBorders = xui.clone(borders,function(h,i){return i!='id' && i!='border'});
                }
            }
            return layoutData;
        },
        _renderAsHandsontable: function(prf){
            if(!prf || !prf.box)return;
            var onLayoutChanged = function(prf, force){
                prf.box._layoutChanged(prf,force);
            };
            var boxNode = prf.getSubNode("BOX"),
                elem = boxNode.get(0), 
                htable, 
                prop = prf.properties,
                layoutData = prop.layoutData,
                mode = prf.boxing().getMode(),
                designMode = mode == "design",
                fixedSet = {
                    // "fix" some functions for handsontable
                    autoWrapRow: true,
                    renderAllRows: true,
                    persistentState:false ,

                    // "readonly" handsontable
                    readOnly: !designMode,
                    readOnlyCellClassName:"no",
                    comments: !designMode,
                    disableVisualSelection: !designMode,
                    enterBeginsEditing: designMode,
                    manualRowMove: designMode,
                    manualColumnMove: designMode,
                    contextMenu: designMode,
                    copyable: designMode,
                    copyPaste: designMode,
                    beforeOnCellMouseDown:!designMode?null:function(e,c){
                        // fire event
                        if(c.row===-1 && c.col===-1){
                            e.stopImmediatePropagation();
                        }
                    },
                    afterOnCellMouseUp:!designMode?null:function(e,c){
                        // fire event
                        if(c.row===-1 && c.col===-1){
                            this.deselectCell();
                            prf.getRoot().onClick(true);
                            e.stopImmediatePropagation();
                        }
                    },

                    /* cell render*/
                    // for xui dom id & event handler
                    beforeRenderer: function(TD, row, col, vprop, value, cellprop){
                        var subSerialId = prf.pickSubId('items'),
                              itemId = xui.ExcelFormula.toCellId(col,row);
                        // memory map
                        cellprop.oid=cellprop.id;
                        cellprop.id=itemId;
                        if(cellprop.oid && cellprop.oid!=cellprop.id){
                            prf.$cellIdChangedMap[cellprop.oid]=cellprop.id;
                        }
                        cellprop._serialId=subSerialId;
                        prf.ItemIdMapSubSerialId[itemId] = subSerialId;
                        prf.SubSerialIdMapItem[subSerialId] = cellprop;
                        // customized styles
                        // first time, set cellprop.style from prop.layoutData
                        if(!cellprop.style){
                            cellprop.style = xui.get(prop.layoutData, ["cells", xui.ExcelFormula.toCellId(col,row),"style"]) || {};
                        }
                        // dom
                        TD.id = prf.key + "-ITEM:" + prf.serialId + ":" +subSerialId;
                        xui.UI.$addEventsHandler(prf, TD, true);
                        for(var i in cellprop.style) TD.style[i] = cellprop.style[i];
                        // align class
//                        if(!cellprop.className){
//                            cellprop.className = xui.get(prop.layoutData, ["cells", xui.ExcelFormula.toCellId(col,row),"className"]) || "";
//                        }
                        TD.className = (TD.className||"")  + prf.getClass("ITEM");
                        if(cellprop._child_autoexpandH){
                            TD.style.height=cellprop._child_autoexpandH+"px";
                        }else{
                            TD.style.height="";
                        }
                    },
                    // cell renderer
                    renderer : function(instance, TD, row, col, vprop, value, cellprop){
                        delete cellprop.hiddenChild;
                        var cellId=xui.ExcelFormula.toCellId(col,row),
                              children = prf.children.length ? prf.children : prf._pool_children;
                        if(children){
                            for(var i=0,l=children.length;i<l;i++){
                                if(children[i][1]==cellId){
                                    if(prf.boxing().getMode()=="read"){
                                        var c = children[i][0],ins=c.boxing();
                                        cellprop.hiddenChild = 1;
                                        if(c.key=='xui.UI.CheckBox'||c.key=='xui.UI.SCheckBox'){
                                            TD.innerHTML = '<input type="checkbox" disabled tabindex="-1" '
                                                + (ins.getUIValue()?"checked":"")
                                                +'>' + ins.getCaption();
                                            return TD;
                                        }else{
                                            value = ins.getShowValue?ins.getShowValue():
                                                    ins.getUIValue?ins.getUIValue():
                                                    ins.getCaption?ins.getCaption():
                                                    ins.getHtml?ins.getHtml():
                                                    ins.getLabel?ins.getLabel():
                                            '';
                                        }
                                    }else{
                                        value='';
                                    }
                                }
                            }
                        }

                        Handsontable.renderers.TextRenderer.apply(this, [instance, TD, row, col, vprop, value, cellprop]);
                        return TD;
                    },
                    /* table render*/
                    beforeRender: function(flag){
                        // **: updateSetting will re-render all table elements
                        // we have to reset memory map, and keep children here
                        if(prf._$tableInited){
                            prf.$cellIdChangedMap={};
                            //*** save children first
                            var pool=prf.getSubNode("POOL").get(0),arr=[];
                            xui.arr.each(prf.children,function(v){
                                if(v[0] && v[0].rendered){
                                    pool.appendChild(v[0].getRootNode());
                                    arr.push(v);
                                }
                            });
                            //keep children, prevent to be destroyed
                            if(arr.length){
                                prf._pool_children = arr;
                            }
                            
                            // reset memory map
                            prf.children=[];
                            for(var i in prf.SubSerialIdMapItem)
                                prf.reclaimSubId(i, "items");
                            prf.ItemIdMapSubSerialId={};
                            prf.SubSerialIdMapItem={};
                        }
                    },
                    afterInit:function(){
                        prf._$tableInited=1;
                    },
                    afterRender:function(isForced){
                        //console.log('afterRender');
                        xui.tryF(prf.$onrender,[],prf);

//                        onLayoutChanged(prf);

                        // Set id for important nodes, for getting profile from dom id
                        var node = prf.getSubNode("BOX");
                        node = node.first(); node.id(prf.key + "-MASTER:" + prf.serialId + ":");
                        node = node.first(); node.id(prf.key + "-HOLDER:" + prf.serialId + ":");
                        node = node.first(); node.id(prf.key + "-HIDER:" + prf.serialId + ":");
                        node = node.first(); node.id(prf.key + "-SPREADER:" + prf.serialId + ":");
                        
                        if(prf._$tableInited){
                            var map = prf.$cellIdChangedMap;

                            //*** restore children
                            if(prf._pool_children){
                                xui.arr.each(prf._pool_children,function(v){
                                    delete v[0].$dockParent;
                                    prf.boxing().append(v[0], map[v[1]]||v[1]);
                                });
                                delete prf._pool_children;
                            }
                        }else{
                            //
                            // lazy append
                            var arr=[];
                            xui.each(prf.children,function(v){
                                arr.push(v);
                            });
                            prf.children=[];
                            xui.arr.each(arr,function(v){
                                prf.boxing().append(v[0], v[1]);
                            });

                            prf.getRoot().onMouseup(function(p,e){
                                prf.$lastMousePos = xui.Event.getPos(e);
                            });
                        }
                    },

                    afterSelection: mode=='read'?null:function(){
                        prf.getRoot().css('overflow','visible');
                    },
                    outsideClickDeselects: mode=='read'?null:function(node){
                        //for lang span, or inner renderer
                        while((
                                (!node.id)
                                || node.id==xui.$localeDomId
                                || node.tagName=='tspan'
                            ) 
                            && node.parentNode!==document && node.parentNode!==window
                        ) node=node.parentNode;
                        var p=xui.UIProfile.getFromDom(node);
                        if(p && prf.$popmenu){
                            var r=prf.$popmenu.get(0);
                            if(p==r || p.$parentPopMenu==r || p.$popGrp==r.$popGrp){
                                return false;
                            }
                        }

                        prf.getRoot().css('overflow','');
                        return true;
                    },
                    afterContextMenuShow: !designMode?null:function(context){
                         if(prf.$onPopMenu)prf.$popmenu = prf.$onPopMenu(prf, prf.$popmenu, context.menu);
                         // don't use dft menu
                         context.menu.container.style.display='none';
                    },

                    afterUpdateSettings:function(){
                    // only resize use this
                    //    onLayoutChanged(prf);
                    },
                    afterRedo:function(){
                        onLayoutChanged(prf);
                    },
                    afterUndo:function(){
                        onLayoutChanged(prf);
                    },
                    afterChange:function(change, source){
                        if(source!='loadData' && source!='populateFromArray')
                            onLayoutChanged(prf);
                    },
                    beforeCellAlignment:function(){
                        onLayoutChanged(prf);
                    },
                    afterMergeCells:function(a,b,auto){
                        if(!auto)
                            onLayoutChanged(prf);
                    },
                    afterUnmergeCells:function(a,b,auto){
                        if(!auto)
                            onLayoutChanged(prf);
                    },

                    // reset autoexpand
                    afterRowResize:function(row, size, dblclick){
                        onLayoutChanged(prf);
                        var cells = this.getCellMetaAtRow(row);
                        for(var i=0, l=cells.length;i<l;i++){
                            var target = prf.boxing().getChildren(cells[i].id);
                            if(target['xui.UI.Input'] 
                                && target.getMultiLines && target.getMultiLines()
                                && target.setAutoexpand
                                ) {
                                    target.get(0)._autoexpand = (size-1)+"px";
                                }
                        }
                    },

                    afterColumnResize:function(){
                        onLayoutChanged(prf);
                    },
                    afterColumnSort:function(){
                        onLayoutChanged(prf);
                    },
                    afterRowMove:function(rows, target){
                        onLayoutChanged(prf);
                    },
                    afterColumnMove:function(){
                        onLayoutChanged(prf);
                    },
                    // for fix ManualColumnResize and ManualRowResize
                    afterCreateCol:function(index,amount){
                        onLayoutChanged(prf);

                        // patch for ManualColumnResize
                        var p = this.getPlugin("ManualColumnResize");
                        // new cols
                        var arr=[];
                        for(var i=0;i<amount;i++) arr.push(prop.defaultColumnWidth);
                        // ensure length
                        if(!p.manualColumnWidths) p.manualColumnWidths=[];
                        for(var i=0;i<index;i++) p.manualColumnWidths[i] = p.manualColumnWidths[i] || (void 0);
                        // insert
                        p.manualColumnWidths.splice.apply(p.manualColumnWidths, [index, 0].concat(arr));

                        this.deselectCell();
                        var ns=this;
                        xui.asyRun(function(){
                            ns.selectColumns(index);
                        });
                    },
                    afterCreateRow:function(index,amount){
                        onLayoutChanged(prf);
                        // patch for ManualRowResize
                        var p = this.getPlugin("ManualRowResize");
                        // new row
                        var arr=[];
                        for(var i=0;i<amount;i++) arr.push(prop.defaultRowHeight);
                        // ensure length
                        if(!p.manualRowHeights) p.manualRowHeights=[];
                        for(var i=0;i<index;i++) p.manualRowHeights[i] = p.manualRowHeights[i] || (void 0);
                        // insert
                        p.manualRowHeights.splice.apply(p.manualRowHeights, [index, 0].concat(arr));

                        this.deselectCell();
                        var ns=this;
                        xui.asyRun(function(){
                            ns.selectRows(index);
                        });
                    },
                    afterRemoveCol:function(index,amount){
                        onLayoutChanged(prf);
                        var p = this.getPlugin("ManualColumnResize");
                        if(p.manualColumnWidths){
                            p.manualColumnWidths.splice(index, amount);
                        }
                        this.deselectCell();
                    },
                    afterRemoveRow:function(index,amount){
                        onLayoutChanged(prf);
                        var p = this.getPlugin("ManualRowResize");
                        if(p.manualRowHeights){
                            p.manualRowHeights.splice(index, amount);
                        }
                        this.deselectCell();
                    }
                },
                settings={},t;

            var offset = prf.box._getHeaderOffset(prf);
            // size
            settings.height = prf.$px(prop.height) + offset.top;
            settings.width = prf.$px(prop.width) + offset.left;
            // stretch
            settings.stretchH = (t=prop.stretchH)=="last"?"last":t=="all"?"all":"none";
            // dft widht/height
            settings.rowHeaderWidth  = prop.rowHeaderWidth;
            settings.columnHeaderHeight = prop.columnHeaderHeight;
            settings.defaultColumnWidth = prop.defaultColumnWidth;
            // show header?
            settings.rowHeaders = designMode;
            settings.colHeaders =  designMode;

  
            // merged info
            if(layoutData.merged){
                settings.mergeCells = layoutData.merged;
            }else{
                settings.mergeCells = designMode;
            }

            // data, manualRowResize, minRowHeights, manualColumnResize, colHeights, cellMetas
            // if there's table data
            if(layoutData.cols){
                // cell data
                var minRowHeights=[], colHeights=[], manualRowResize=[],manualColumnResize=[], data = [], row;
                // manualRowResize (start from "1")
                xui.each(layoutData.rowSetting,function(v,k){
                    if(xui.isSet(v.manualHeight||v))manualRowResize[parseInt(k,10) - 1]=parseInt(v.manualHeight||v,10);
                    if(xui.isSet(v.height||v))minRowHeights[parseInt(k,10) - 1]=parseInt(v.height||v,10);
                });
                // manualColumnResize (start from "A"=>"1")
                xui.each(layoutData.colSetting,function(v,k){
                    k = xui.ExcelFormula.toColumnNum(k);
                    if(xui.isSet(v.manualWidth||v))manualColumnResize[k - 1]=parseInt(v.manualWidth||v,10);
                    if(xui.isSet(v.width||v))colHeights[k - 1]=parseInt(v.width||v,10);
                });
                // init data
                for(var i=0,l=layoutData.rows||prop.defaultRowSize;i<l;i++){
                    data.push(row=[]);
                    for(var m=0,n=layoutData.cols||prop.defaultColumnSize;m<n;m++){
                        row.push(null);
                    }
                }
                // fill data
                xui.each(layoutData.cells,function(cell, id){
                    var coord = xui.ExcelFormula.toCoordinate(id);
                    data[coord.row][coord.col] = xui.isSet(cell.value)?cell.value:null;
                });
                
                // set manualRowResize, manualColumnResize and data
                if(!xui.isEmpty(manualRowResize)){
                    for(var i=0;i<layoutData.rows;i++){
                        manualRowResize[i] = manualRowResize[i] || prop.defaultRowHeight;
                    }
                }
                settings.manualRowResize = !xui.isEmpty(manualRowResize) ? manualRowResize : designMode;
                settings.manualColumnResize = !xui.isEmpty(manualColumnResize) ? manualColumnResize : designMode;
                
                if(!xui.isEmpty(minRowHeights))settings.rowHeights = minRowHeights;
                if(!xui.isEmpty(colHeights))settings.colHeights = colHeights;

                settings.data = data;

                if(layoutData.customBorders)
                    settings.customBorders = layoutData.customBorders;

                prf.$htable = htable = new Handsontable(elem, xui.merge(settings, fixedSet, 'all'));
            }else{
                settings.manualColumnResize = designMode;
                var manualRowResize=[];
                for(var i=0;i<prop.defaultRowSize;i++){
                    manualRowResize[i] = prop.defaultRowHeight;
                }
                settings.manualRowResize = manualRowResize;

                // set data only
                 settings.data = Handsontable.helper.createSpreadsheetData(prop.defaultRowSize, prop.defaultColumnSize);

                prf.$htable = htable = new Handsontable(elem, xui.merge(settings, fixedSet, 'all'));
                
                // reset layoutData
                prf.properties.layoutData = prf.box._getLayoutData(prf);
            }
            
            // set before destroy function
            (prf.$beforeDestroy=(prf.$beforeDestroy||{}))["destroyhtable"]=function(){
                var t;
                if(t=this.$htable){
                    // must purge lazy-bound node here
                    var node=this.getSubNode("BOX").get(0);
                    if(node)
                        xui.$purgeChildren(node);

                    if(!t.isDestroyed){
                        Handsontable.hooks.destroy(t);
                        t.destroy();
                    }
                    delete this.$htable;
                }
                if(t = this.$popmenu){
                    t.destroy();
                }
            }
        },
        _resizeHTable: function(prf,size){
            var t;
            if(prf.box.renderType=="handsontable" && (t=prf.$htable)){
                var holder = prf.getSubNode("HOLDER").cssSize();
                if(holder.width!=size.width || holder.height!=size.height){
                    // for merged cells
                    size.mergeCells  = xui.copy(xui.get(t.getPlugin("mergeCells"),["mergedCellsCollection","mergedCells"]));
                    // ensure by px
                    t.updateSettings(size);
                }
            }
        },
        _updateSetting:function(prf, opt){
            var t;
            if(prf.box.renderType=="handsontable" && (t=prf.$htable)){
                if(typeof opt=="string"){
                    var h={};
                    h[opt] = prf.properties[opt];
                    opt=h;
                }
                // for merged cells
                opt.mergeCells  = xui.copy(xui.get(t.getPlugin("mergeCells"),["mergedCellsCollection","mergedCells"]));
                t.updateSettings(opt);
            }
        },
        $beforeAppend:function(prf,target,subId){
            if(!subId)return;
            // only one allowed
            if(target.size()==1){
                xui.arr.each(prf.children,function(v){
                    if(v[0] && subId == v[1] && v[0]!==target.get(0) ){
                        v[0].boxing().destroy();
                    }
                }, true);
            }
        },
        $afterAppend:function(prf, target,subId){
            if(!subId)return;
            // force dock for the only widget
            if(prf.renderId && target['xui.UI'] && target.size()==1){
                var item = prf.getItemByItemId(subId), inputPrf = target.get(0);
                if(!inputPrf._attached2cell){
                    //console.log('afterappend',subId);
                    inputPrf._attached2cell = inputPrf.locked = 1;
                    if(item.hiddenChild){
                        target.setDisplay('none');
                    }else{
                        target.setDisplay('');
                        var cell = prf.getSubNode("ITEM", item._serialId),
                            adjustSize = function(){
                                target.setPosition('absolute').setLeft(0).setTop(0);
                                // first row/col , 2 pix border
                                if(target.setWidth)target.setWidth(cell.offsetWidth()-(item.col?1:2));
                                if(target.setHeight)target.setHeight(cell.offsetHeight()-(item.row?1:2));
                            };
                        adjustSize();
                        cell.onSize(adjustSize,'cellresize');

                        if(target.setLabelPos)  target.setLabelPos('none').setLabelCaption('').setLabelSize('0');
                        if(target.setVAlign)  target.setVAlign('middle');
                        if(target['xui.UI.Input'] 
                            && target.getMultiLines && target.getMultiLines()
                            && target.setAutoexpand
                        ) 
                        {
                            // use the hidden one: _autoexpand
                            // once: set minH from subId
                            if(!parseFloat(inputPrf._autoexpand)){
                                // need set autoexpand in afterRowResize too
                                inputPrf._autoexpand = (cell.offsetHeight()-1)+"px";
                                inputPrf.$beforeAutoexpand=function(p,h){
                                    item._child_autoexpandH = target.getAutoexpandHeight();
                                    // ensure to trigger table render once
                                    xui.resetRun(prf.getUid("autoex"), function(){
                                        if(prf.$htable)prf.$htable.render();
                                    });
                                    return false;
                                };
                                // try to trigger aoutoexpand
                                inputPrf.box._checkAutoexpand(inputPrf);
                            }
                        }
                    }
                    inputPrf.$handleCustomVars=function(d){
                        if(d){
                            for(var i in d)if(d[i])this[i]=d[i];
                        }else{
                            return {
                                _attached2cell: this._attached2cell,
                                _autoexpand: this._autoexpand,
                                $beforeAutoexpand: this.$beforeAutoexpand
                            }
                        }
                    }
                }
            }
        },
        _onresize:function(prf,width,height){
            var prop=prf.properties,
                // compare with px
                us = xui.$us(prf),
                adjustunit = function(v,emRate){return prf.$forceu(v, us>0?'em':'px', emRate)},
                root = prf.getRoot(),
                boxNode = prf.getSubNode('BOX'),
                offset = prf.box._getHeaderOffset(prf),
                // caculate by px
                ww=width?prf.$px(width):width, 
                hh=height?prf.$px(height):height,
                t;
            if( width ||  height){
                // reset here
                if(width)prop.width=adjustunit(ww);
                if(height)prop.height=adjustunit(hh);

                boxNode.css({
                    marginLeft:-offset.left+"px",
                    marginTop:-offset.top+"px",
                    width:width?(ww+offset.left+'px'):null,
                    height:height?(hh+offset.top+'px'):null
                });

                xui.resetRun(prf.getUid("resize"),function(){
                   if(prf&&prf.box)prf.box._resizeHTable(prf, prf.getSubNode('BOX').cssSize());
                });
            }
        }
    }
});