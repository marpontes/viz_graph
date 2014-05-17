var _syst;
var _arbr;
var _vwpo;
var arrColorValues = ['red', 'green', 'blue', 'yellow', 'black', 'gray', 'yellowgreen', 'orangered'];
var arrColorLabels = ['Red', 'Green', 'Blue', 'Yellow', 'Black', 'Gray', 'Yellow Green', 'Orange Red'];

// Utilize the required API for verifying that the VizController has been loaded before registration
pen.require(["common-ui/vizapi/VizController"], function () {

    // Register the visualization metadata with the Visualization API
    pentaho.visualizations.push({
        id: 'viz_graph', // unique identifier 
        type: 'Arbor', // generic type id 
        source: 'Graph', // id of the source library 
        name: 'Graph Chart', // visible name, this will come from a properties 
        // file eventually 
        'class': 'tgraph.Arbor', // type of the Javascript object to instantiate 
        args: { // arguments to provide to the Javascript object 
            // this allows a single class to act as multiple visualizations
            fromShape: 'box',
            toShape: 'dot',
            fromColor: 'orangered',
            toColor: 'yellowgreen',
            showFromLabels : 'YES',
            showToLabels : 'NO'
            
        },
        propMap: [],
        dataReqs: [ // dataReqs describes the data requirements of 
            // this visualization 
            {
                name: 'Default',
                reqs: [{
                    id: 'from', // ID of the data element 
                    dataType: 'string', // data type - 'string', 'number', 'date', 
                    // 'boolean', 'any' or a comma separated list 
                    dataStructure: 'column', // 'column' or 'row' - only 'column' supported
                    // so far 
                    caption: 'From', // visible name 
                    required: true, // true or false 
                    allowMultiple: false,
                    ui: {
                        group: 'data'
                    }
                }, {
                    id: 'to', // ID of the data element 
                    dataType: 'string', // data type - 'string', 'number', 'date', 
                    // 'boolean', 'any' or a comma separated list 
                    dataStructure: 'column', // 'column' or 'row' - only 'column' supported
                    // so far 
                    caption: 'To', // visible name 
                    required: true, // true or false 
                    allowMultiple: false,
                    ui: {
                        group: 'data'
                    }
                }, {
                    id: 'measures',
                    dataType: 'number',
                    dataStructure: 'column',
                    caption: 'Measure',
                    required: true,
                    allowMultiple: false,
                    ui: {
                        group: "data"
                    }
                }, {
                    id: 'fromShape',
                    dataType: 'string',
                    values: ['dot', 'box'],
                    ui: {
                        labels: ['Circle', 'Box'],
                        group: 'options',
                        type: 'combo', // combo, checkbox, slider, textbox, gem, 
                        // gemBar, and button are valid ui types
                        caption: 'FROM Node Shape'
                    }
                }, {
                    id: 'toShape',
                    dataType: 'string',
                    values: ['dot', 'box'],
                    ui: {
                        labels: ['Circle', 'Box'],
                        group: 'options',
                        type: 'combo', // combo, checkbox, slider, textbox, gem, 
                        // gemBar, and button are valid ui types
                        caption: 'TO Node Shape'
                    }
                }, {
                    id: 'fromColor',
                    dataType: 'string',
                    values: arrColorValues,
                    ui: {
                        labels: arrColorLabels,
                        group: 'options',
                        type: 'combo', // combo, checkbox, slider, textbox, gem, 
                        // gemBar, and button are valid ui types
                        caption: 'FROM color'
                    }
                }, {
                    id: 'toColor',
                    dataType: 'string',
                    values: arrColorValues,
                    ui: {
                        labels: arrColorLabels,
                        group: 'options',
                        type: 'combo', // combo, checkbox, slider, textbox, gem, 
                        // gemBar, and button are valid ui types
                        caption: 'TO color'
                    }
                }, {
                    id: 'showFromLabels',
                    dataType: 'string',
                    values: ["YES","NO"],
                    ui: {
                        labels: ["Yes","No"],
                        group: 'options',
                        type: 'combo', // combo, checkbox, slider, textbox, gem, 
                        // gemBar, and button are valid ui types
                        caption: 'Show FROM Labels'
                    }
                }, {
                    id: 'showToLabels',
                    dataType: 'string',
                    values: ["YES","NO"],
                    ui: {
                        labels: ["Yes","No"],
                        group: 'options',
                        type: 'combo', // combo, checkbox, slider, textbox, gem, 
                        // gemBar, and button are valid ui types
                        caption: 'Show TO Labels'
                    }
                }]
            }
        ],
        menuOrdinal: 10001,
        menuSeparator: true,
        maxValues: [1000, 2000, 3000]
    });




    tgraph = {};

    tgraph.Arbor = function (canvasElement) {

        arbr = this;
        var sys;

        var vpID = "graphViewport";
        var viewport;
        var labelElement;

        this.newCanvas = function () {
            viewport = null;
            viewport = $(document.createElement('canvas')).attr('id', vpID);
            
            labelElement = null;
            labelElement = $(document.createElement('div'))
            .attr('id','ArborHover').css('position','absolute')
            $(canvasElement).empty().append(viewport)
            .append(labelElement);
            _vwpo = viewport;
        };

        this.fixScrollBar = function () {
            var wid = parseInt(viewport.parent().width(), 10);
            $("#vizdiv0").css("width", (wid - 20) + "px");
            $("#visualPanelElement-0").css("width", (wid - 20) + "px")
            $("#graphViewport").css("width", (wid - 20) + "px");
            setTimeout(function () {
                $("#vizdiv0").css("width", wid + "px");
                $("#visualPanelElement-0").css("width", wid + "px")
                $("#graphViewport").css("width", wid + "px");
            }, 10);

        };

        this.resize = function (width, height) {

            var wid = viewport.parent().width();
            var hei = viewport.parent().height();

            viewport.attr("width", wid);
            viewport.attr("height", hei);
            sys.screenSize(wid, hei);
            sys.renderer.redraw();
            this.fixScrollBar();
        };


        this.draw = function (datView, vizOptions) {
            if (sys)
                sys.prune();

            this.newCanvas();
            
            /*
            
            	*
            	* This part of the code demonstrates how to get member properties
            	* from the dataTable
            	*
            
            this.dataTable = datView.dataTable;
            for( var columnIdx=0; columnIdx<this.dataTable.getNumberOfColumns(); columnIdx++) {
            	var type = this.dataTable.getColumnProperty(columnIdx,'geoRole');
            	console.log("---------------------")
            	console.log(type);
            	console.log("---------------------")
            }
            */

            var rows = datView.dataTable.jsonTable.rows; // Rows from the resultset
            sys = arbor.ParticleSystem(2600, 400, 0.5); // arbor sys
            sys.parameters({
                gravity: true
            }); // arbor param
            sys.renderer = Renderer("#" + vpID); // arbor param
            var data = {
                nodes: {},
                edges: {}
            };

            /* Loading the json with the resultset values
             */
            for (x = 0; x < rows.length; x++) {

                /* Here we add[ToSet] each node and then the relations between them
                 */
                var from = rows[x].c[0].f;
                var to = rows[x].c[1].f;
                
                var fromLabel = vizOptions.showFromLabels == "YES" ? from : '';
                var toLabel   = vizOptions.showToLabels == "YES" ? to   : '';
                
                data.nodes[from] = {
                    'color': vizOptions.fromColor,
                    'shape': vizOptions.fromShape,
                    'label': fromLabel
                };
                data.nodes[to] = {
                    'color': vizOptions.toColor,
                    'shape': vizOptions.toShape,
                    'label': toLabel
                };


                try {
                    if (data.edges[from]) {
                        data.edges[from][to] = {};
                    } else {
                        data.edges[from] = JSON.parse('{ "' + to + '":{} }');
                    }
                } catch (e) {}

            }
            //
            this.resize();
            sys.graft(data);
            syst = sys;

        }



    };




});