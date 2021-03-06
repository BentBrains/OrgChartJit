// ST var
var st;
(function() {
    var ua = navigator.userAgent,
        iStuff = ua.match(/iPhone/i) || ua.match(/iPad/i),
        typeOfCanvas = typeof HTMLCanvasElement,
        nativeCanvasSupport = (typeOfCanvas == 'object' || typeOfCanvas == 'function'),
        textSupport = nativeCanvasSupport
            && (typeof document.createElement('canvas').getContext('2d').fillText == 'function');
    //I'm setting this based on the fact that ExCanvas provides text support for IE
    //and that as of today iPhone/iPad current text support is lame
    labelType = (!nativeCanvasSupport || (textSupport && !iStuff))? 'Native' : 'HTML';
    nativeTextSupport = labelType == 'Native';
    useGradients = nativeCanvasSupport;
    animate = !(iStuff || !nativeCanvasSupport);
})();

function init(){
    //get the container height to set the root node in the top
    var height = ($('#infovis').height() / 2) - 60;
    var json = {"children":[{"name":"General Committee","id":80,"children":[{"name":"Executive Committee","id":81,"children":[{"name":"Executive Director","id":82,"children":[{"name":"Operation Assistant","id":83,"children":[{"name":"PC(EIGP)","id":85,"children":[{"name":"Officer","id":91,"children":[],"data":{"code":"3","type":"Type 1","description":"The description of Officer","type_id":1}}],"data":{"code":"3","type":"Type 2","description":"The description of PC(EIGP)","type_id":2}},{"name":"PC(SDP)","id":86,"children":[{"name":"Supervisor","id":92,"children":[],"data":{"code":"3","type":"Type 1","description":"The description of Supervisor","type_id":1}}],"data":{"code":"3","type":"Type 2","description":"The description of PC(SDP)","type_id":2}},{"name":"PC(HRRDP)","id":87,"children":[{"name":"Data Collector","id":93,"children":[],"data":{"code":"3","type":"Type 1","description":"The description of Data Collector","type_id":1}}],"data":{"code":"3","type":"Type 2","description":"The description of PC(HRRDP)","type_id":2}}],"data":{"code":"3","type":"Type 2","description":"The description of the Operation Assistant","type_id":2}},{"name":"Finance Assistant","id":84,"children":[{"name":"Chief Auditor","id":88,"children":[{"name":"Auditor","id":95,"children":[],"data":{"code":"3","type":"Type 1","description":"The description of Auditor","type_id":1}}],"data":{"code":"3","type":"Type 1","description":"The description of Chief Auditor","type_id":1}},{"name":"Chief Accountant","id":89,"children":[{"name":"Cashier","id":96,"children":[],"data":{"code":"3","type":"Type 1","description":"The description of Cashier","type_id":1}}],"data":{"code":"3","type":"Type 2","description":"The description of Chief Auditor","type_id":2}},{"name":"Chief Administrative Officer","id":90,"children":[{"name":"Store Keeper","id":97,"children":[],"data":{"code":"3","type":"Type 1","description":"The description of Store Keeper","type_id":1}}],"data":{"code":"3","type":"Type 1","description":"The description of Administrative Officer","type_id":1}}],"data":{"code":"3","type":"Type 2","description":"The description of the finance assistant","type_id":2}}],"data":{"code":"3","type":"Type 2","description":"The description of the executive director","type_id":2}}],"data":{"code":"2","type":"Type 2","description":"The description of the executive committee","type_id":2}}],"data":{"code":"1","type":"Type 1","description":"The description of the general committee","type_id":1}}],"name":"Technology Inc.","id":0};
    //init Spacetree
    //Create a new ST instance
    st = new $jit.ST({
        orientation: "top",
        //id of viz container element
        injectInto: 'infovis',
        //set duration for the animation
        duration: 100,
        //set animation transition type
        transition: $jit.Trans.Quart.easeInOut,
        //set distance between node and its children
        levelDistance: 50,
        //enable panning
        Navigation: {
            enable:true,
            panning:true,
            zooming: 5
        },
        //set node and edge styles
        //set overridable=true for styling individual
        //nodes or edges
        Node: {
            height: 80,
            width: 200,
            type: 'rectangle',
            color: '#4b6a86',
            overridable: true
        },

        Edge: {
            type: 'bezier',
            overridable: true
        },

        //Needed for not hiding
        constrained: false,
        levelsToShow: 100,

        //This method is called on DOM label creation.
        //Use this method to add event handlers and styles to
        //your node.
        onCreateLabel: function(label, node){

            label.id = node.id;
            var actions;
            var add_node_link = '<a class="add_node"></a>';
            var delete_node_link = '<a class="delete_node"></a>';
            var edit_node_link = '<a class="edit_node"></a>';
            var action_class = '';
            if (node.id == 0) {
                add_node_link = '<a class="add_node alone"></a>';
                delete_node_link = '';
                edit_node_link = '';
                action_class = 'options_works';
            }
            actions = '<div class="options ' + action_class + '" style="display: none;">' + add_node_link + edit_node_link + delete_node_link + '</div>';
            if(node.name) {
                label.innerHTML = '<div class="node_container"><label class="node_name">' + node.name.substr(0, 40)+'</label>'+actions+'</div>';
            }
            label.onclick = function(){
                make_movement(node);
            };

            //event to show/hide the options of node
            $(label).hover(function(){
                $(this).find('div.options').show();
            }, function(){
                $(this).find('div.options').hide();
            });

            //event to stop propagation of the add, edit and delete nodes
            $(label).find('.options').children('.edit_node, .add_node, .delete_node, .node_info').click(function (e) {

                if($(this).hasClass('edit_node')){
                    show_edit_form($(this));
                } else if($(this).hasClass('add_node')){
                    show_add_form($(this));
                } else if($(this).hasClass('delete_node')){
                    show_delete_form($(this));
                } else if($(this).hasClass('node_info')){
                    show_node_info($(this));
                }
                e.preventDefault();
                e.stopPropagation();
            });

            //set label styles
            var style = label.style;
            style.width = 200 + 'px';
            style.minHeight = 80 + 'px';
            style.cursor = 'pointer';
            style.color = '#333';
            style.fontSize = '0.8em';
            style.textAlign= 'center';
            style.paddingTop = '3px';
        },

        //This method is called right before plotting
        //a node. It's useful for changing an individual node
        //style properties before plotting it.
        //The data properties prefixed with a dollar
        //sign will override the global node style properties.
        onBeforePlotNode: function(node){
            //add some color to the nodes in the path between the
            //root node and the selected node.
            var nodes_color = ['#2199CC', '#27B5F1', '#60CFFE'];
            if (node.selected) {
                node.data.$color = "#136283";
            }
            else {
                delete node.data.$color;
                node.data.$color = nodes_color[node._depth>2 ? 2: node._depth];

                //if the node belongs to the last plotted level
                if(!node.anySubnode("exist")) {
                    //count children number
                    var count = 0;
                    node.eachSubnode(function(n) { count++; });
                    //assign a node color based on
                    //how many children it has
                    if(count > 0)
                        node.data.$color = '#E9BC42';
                }

            }
            setLabelScaling();

        },

        //This method is called right before plotting
        //an edge. It's useful for changing an individual edge
        //style properties before plotting it.
        //Edge data proprties prefixed with a dollar sign will
        //override the Edge global style properties.
        onBeforePlotLine: function(adj){
            if (adj.nodeFrom.selected && adj.nodeTo.selected) {
                adj.data.$color = "#BFBBC0";
                adj.data.$lineWidth = 3;
            }
            else {
                delete adj.data.$color;
                delete adj.data.$lineWidth;
            }
        }
    });
    //load json data
    st.loadJSON(json);
    //compute node positions and layout
    st.compute();
    //optional: make a translation of the tree
    //st.geom.translate(new $jit.Complex(-200, 0), "current");
    //emulate a click on the root node.
    st.onClick(st.root, {
        Move: {
            offsetX: 0,
            offsetY: height,
            enable: true
        }
    });

    var top = $jit.id('r-top'),
        left = $jit.id('r-left'),
        bottom = $jit.id('r-bottom'),
        right = $jit.id('r-right'),
        normal = $jit.id('s-normal');


    function changeHandler() {
        if(this.checked) {
            top.disabled = bottom.disabled = right.disabled = left.disabled = true;
            st.switchPosition(this.value, "animate", {
                onComplete: function(){
                    top.disabled = bottom.disabled = right.disabled = left.disabled = false;
                }
            });
        }
    }
}

function make_movement(node, callback){
    callback = callback || false;
    if(!node.anySubnode("exist")){
        node['collapsed']=true;

        node.eachSubgraph(function(subnode) {
            if(node.id!=subnode.id)
            {
                subnode.drawn=false;
                subnode.setData('alpha',1);
            }
        });

        st.onClick(node.id, {
            Move:{
                enable: true,
                offsetX: node.pos.getc(true).x * -1,
                offsetY: node.pos.getc(true).y * -1
            },
            onComplete: function(){
                if(callback)
                    callback();
            }
        });

    } else {
        node['collapsed']=false;

        node.eachSubgraph(function(subnode) {
            if(node.id!=subnode.id)
            {
                subnode.exist=false;
                subnode.drawn=false;
                subnode.setData('alpha',0);
            }

        });

        st.move(node, {
            Move: {
                enable: true,
                offsetX: node.pos.getc(true).x * -1,
                offsetY: node.pos.getc(true).y * -1
            },
            onComplete: function() {
                if(callback)
                    callback();
            }
        });
    }
}

function show_add_form(to_node){
    $add_to_node = to_node.closest('div.node');
    add_to_node_id = $add_to_node.attr('id');
    $('#addNodeModal').modal('show');
}

function show_delete_form($delete_link){
    var $node = $delete_link.closest('div.node');
    node_id = $node.attr('id');
    node_name = $node.find('label.node_name').html();

    var message = '<div>If you delete the node <strong>'+node_name+'</strong>, all its children will be deleted. ??Continue?</div>';
    $('#delete_message_container').html(message);
    $('#node_to_remove_id').val(node_id);
    $('#deleteNodeModal').modal('show');
}

function show_node_info($info_link){
    var $node = $info_link.closest('div.node');
    node = st.graph.getNode($node.attr('id'));
        var message = '<div>Name: '+node.name+'<br>Description: '+node.data.description+'' +
        '<br>Code: '+node.data.code+'<br>Type: '+node.data.type+'</div>';
    $('#info_message_container').html(message);
    $('#node_id').val(node_id);
    $('#infoNodeModal').modal('show');
}

function show_edit_form($edit_link){
    $node = $edit_link.closest('div.node');
    node = st.graph.getNode($node.attr('id'));
    $('#edit_node_name').val(node.name);
    $('#edit_node_code').val(node.data.code);
    $('#edit_node_type').val(node.data.type_id);
    $('#edit_node_description').val(node.data.description);
    $('#editNodeModal').modal('show');
}


function add_movement_tree(){
    $('#addNodeModal').modal('hide');
    st.addSubtree(new_node_object, 'replot');
    node = st.graph.getNode(node.id);
    make_movement_action(node);
    console.log(new_node_object);
    st.select(node.id, {
        onComplete: function () {
            st.addSubtree(new_node_object, 'replot');
            node = st.graph.getNode(node.id);
            make_movement_action(node);
        }
    });
}

function delete_movement_tree(){
    $('#deleteNodeModal').modal('hide');
    parent_node = st.graph.getNode(parent_id);
    st.removeSubtree(node.id, true, 'replot');
    make_movement_action(parent_node);
}

function make_movement_action(node_move){
    if (node_move['collapsed'] == false) {
        st.move(node_move, {
            Move: {
                enable: true,
                offsetX: node_move.pos.getc(true).x * -1,
                offsetY: node_move.pos.getc(true).y * -1
            }
        });
    }
    else {
        st.onClick(node_move.id, {
            Move: {
                enable: true,
                offsetX: node_move.pos.getc(true).x * -1,
                offsetY: node_move.pos.getc(true).y * -1
            }
        });
    }
}

function setLabelScaling() {
    var x = st.canvas.scaleOffsetX,
    y = st.canvas.scaleOffsetY;
    $(".node").css("-moz-transform", "scale(" + x +"," +  y + ")");
    $(".node").css("-webkit-transform", "scale(" + x +"," + y + ")");
    $(".node").css("-ms-transform", "scale(" + x +"," +  y + ")");
    $(".node").css("-o-transform", "scale(" + x +"," +  y + ")");
}

$( document ).ready(function() {
    $("#add_node").click(function(e) {
        //Validate Form
        if (!$('#addNodeForm')[0].checkValidity()) {
            $('#submit_add_node').click();
            return false;
        }
        e.preventDefault();
        var node_name = $("#new_node_name").val();
        var node_type_id = $("#new_node_type").val();
        var node_type = $("#new_node_type option:selected").text();
        var node_code = $("#new_node_code").val();
        var node_description = $("#new_node_description").val();

        new_node_object = {
            "id": parseInt(add_to_node_id),
            "children": [{
                "name": node_name,
                "id": Math.floor((Math.random() * 10000) + 1),
                "data":{
                    "code": node_code,
                    "type_id": node_type_id,
                    "type": node_type,
                    "description": node_description
                }
            }]
        };

        node = st.graph.getNode(add_to_node_id);

        if (node['collapsed'] == false)
            make_movement(node, function () {
                add_movement_tree();
            });
        else
            add_movement_tree();
    });

    $('#delete_node').click(function(){
        node = st.graph.getNode(node_id);
        parent_id = node.getParents()[0].id;
        st.select(parent_id, {
            onComplete: function () {
                delete_movement_tree();
            }
        });
    });

    $('#edit_node').click(function(){
        //Validate Form
        if (!$('#editNodeForm')[0].checkValidity()) {
            $('#submit_edit_node').click();
            return false;
        }

        var node_name = $("#edit_node_name").val();
        var node_type_id = $("#edit_node_type").val();
        var node_type_text = $("#edit_node_type option:selected").text();
        var node_code = $("#edit_node_code").val();
        var node_description = $("#edit_node_description").val();

        var edit_node_object = {
            "name": node_name,
            "id": node.id,
            "data":{
                "code": node_code,
                "type_id": node_type_id,
                "description": node_description
            }
        };

        node.name = node_name;
        node.data.type_id = node_type_id;
        node.data.type = node_type_text;
        node.data.code = node_code;
        node.data.description = node_description;

        var $label = $('div#'+node.id).find('label.node_name');
        $label.slideUp();
        $label.html('');
        if(node.name) {
            $label.html(node.name.substr(0, 20));
        }
        $label.slideDown();

        st.select(node.id, {
            onComplete: function () {
                $('#editNodeModal').modal('hide');
            }
        });
    });

    init();
});












