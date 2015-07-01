;function(scope){
  // expose to public
  scope.autoIndex = function (article) {
    // get headers in rootEle
    var nodes = [];
    traverse(article, function(n) {
      var match = /^H([1-6])$/.exec(n.tagName);
      if(match != null) {
        var node = {
          level: match[1],
          anchor: n.id,
          title: n.textContent || n.innerText
        }
        nodes.push(node);
      }
    });

    var root = new Node({level: 0}), last = root, ele, result;
    root.fromArray(nodes, function(cur, last) { // construct Node
      return last.data.level < cur.data.level;
    }).traverse(function(data) { // traverse tree node and construct DOM
      if(this.isRoot()) ele = result = domUl();
      else {
        if(this.isSibling(last.parent)) ele = ele.parentNode.parentNode;

        var li = domLi(), newl;
        li.appendChild(createAnchor(data));

        if(this.hasChildren()) {
          var newl = domUl();
          li.appendChild(newl);
        }

        ele.appendChild(li);
        if(newl) ele = newl;

        last = this;
      }
    });

    return result;

    // traverse dom node
    function traverse(node, action, filter) {
      if(typeof action != 'function') throw 'action should be a function.';
      if(typeof filter != 'function' || filter(node)) action.call(null, node);

      var children = Array.prototype.slice.call(node.children), l = children.length;
      if(l > 0) {
        for(var i = 0; i < l; i++) {
          traverse(children[i], action, filter);
        }
      }
    }

    // create anchor node by data
    function createAnchor(data) {
      var a = document.createElement('a');
      a.href = '#' + data.anchor;
      a.textContent = data.title;
      return a;
    }

    function domUl() {
      return document.createElement('ul');
    }

    function domLi() {
      return document.createElement('li');
    }
  }

  /**
   * Constructor of a tree node.
   * @constructor Node
   * @param {Object} data - the data which held by a node
   */
  function Node(data) {
    this.data = data;
    this.children = [];
    this.parent = null;
  }

  /**
   * Decide the node is root or not.
   * @return {Boolean}
   */
  Node.prototype.isRoot = function () {
    return this.parent == null;
  };

  /**
   * Decide the node is a sibling of another node.
   * @param  {Node}  node
   * @return {Boolean}
   */
  Node.prototype.isSibling = function (node) {
    return !!node && this.parent == node.parent;
  };

  /**
   * Decide the node has children or not.
   * @return {Boolean}
   */
  Node.prototype.hasChildren = function () {
    return this.children.length > 0;
  };

  /**
   * Append node to a parent node.
   * @param  {Node} parent - parent node to append to
   * @return {Node} return parent node
   */
  Node.prototype.appendTo = function (parent) {
    if(parent instanceof Node) {
      this.parent = parent;
      parent.children.push(this);
    }

    return parent;
  };

  /**
   * Append a child to itself.
   * @param  {Node} child - a child to append
   * @return {Node} return itself
   */
  Node.prototype.append = function (child) {
    if(child instanceof Node) {
      this.children.push(child);
      child.parent = this;
    }
  };

  /**
   * Depth-first traversal, a function will be called everytime traverse to a node,
   * it take data as the first argument, and the execute content is binded to Node itself.
   * @param  {Function} action - an action to execute
   * @return {Node} return itself
   */
  Node.prototype.traverse = function traverse(action) {
    if(typeof action != 'function') throw 'action should be a function.';

    action.call(this, this.data);
    if(this.children.length > 0) { // not leaf
      for(var i = 0, l = this.children.length; i < l; i++) {
        this.children[i].traverse(action);
      }
    }

    return this;
  };

  /**
   * Get tree structure from array.
   * @param  {Array} arr - Array source
   * @param  {Function} filter - Decide current node to be last node's child or not
   * @return {Node} return itself
   */
  Node.prototype.fromArray = function (arr, filter) {
    var last = this;
    for(var i = 0, l = arr.length; i < l; i++) {
      var node = arr[i], treeNode = new Node(node);
      findParent(treeNode, last, filter);
      last = treeNode;
    }

    function findParent(node, start, filter) {
      if(node == null || start == null) return;
      if(filter(node, start)) {
        start.append(node);
      }
      else {
        findParent(node, start.parent, filter);
      }
    }

    return this;
  };
}(this)
