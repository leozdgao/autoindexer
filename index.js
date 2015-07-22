(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define([], function () {
            return (root['autoIndex'] = factory());
        });
    } else if (typeof exports === 'object') {
        // Node. Does not work with strict CommonJS, but
        // only CommonJS-like enviroments that support module.exports,
        // like Node.
        module.exports = factory();
    } else {
        // Browser globals
        root['autoIndex'] = factory();
    }
}(this, function () {
  var AutoIndexer = {};
  /**
   * Genrator of an autoIndexer according the options
   * @param  {Object} opts - options for auto indexer
   * @return {Function} An autoIndexer
   */
  AutoIndexer.createIndexer = function(opts) {
    opts = opts || {};
    var maxLevel = opts.maxLevel || 3; // max level, default to 3

      // an indexer
    return {
      getMaxLevel: function() {
        return maxLevel;
      },
      getNode: function(article) {
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

        var root = new Node({level: 0}); // a fake root node
        root.fromArray(nodes, function(cur, last) { // construct Node
          return last.data.level < cur.data.level;
        });

        return root;

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
      },
      construct: function(article) {
        var root = this.getNode(article);
        var result = domUl(), children = root.children;
        for(var i = 0, l = children.length; i < l; i++) {
          result.appendChild(construct(children[i]));
        }

        return result;

        // construct a single node
        function construct(node) {
          var li = domLi();
          li.appendChild(createAnchor(node.data));

          if(node.hasChildren() && node.getDepth() != maxLevel) {
            var children = node.children, ele = domUl();
            for(var i = 0, l = children.length; i < l; i++) {
              ele.appendChild(construct(children[i], domUl()));
              li.appendChild(ele);
            }
          }

          return li;
        }
      }
    }

    // create anchor node by data
    function createAnchor(data) {
      var a = document.createElement('a');
      a.href = location.pathname + '#' + data.anchor;
      a.target = '_self';
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
   * Get depth of tree node.
   * @return {Number}
   */
  Node.prototype.getDepth = function () {
    var i = 0, p = this.parent;
    while(p != null) {
      i++; p = p.parent;
    }
    return i;
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

  return AutoIndexer;
}));
