# AutoIndexer
Generate index automatically for your article. Use umd, so it can be bundled by browserify/webpack if you'd like to.

## How to use

It's very easy to use, just give it the root node which hold the article.

If I have my article structure like this:

```html
<div id="article">
  <h1>Title0</h1>
  <p>Content here.</p>
  <h2>Title1</h2>
  <p>Content here.</p>
  <h2>Title2</h2>
  <p>Content here.</p>
  <h1>Title3</h1>
  <p>Content here.</p>
  <h2>Title4</h2>
  <p>Content here.</p>
</div>
<div id="index"></div>
```

Then just pass the article node to it:

```javascript
var indexer = createIndexer();
var articleNode = document.getElementById('article');
var index = document.getElementById('index');
var ul = indexer(articleNode);
index.appendChild(ul);
```

It returns a UL node and you can decide which node it append to.

- Title0
 - Title1
 - Title2
- Title3
 - Title4

#### Options

|Options|Description|
|-------|-----------|
|maxLevel|Max hierarchal level of index, default to 3.|

## How it work

It will find any Header element in your article, and composite them to a tree according two points:

- The level of header, the bigger level hold others as children and the same level headers as siblings.
- The order of occurence, which decide the order of siblings.

Which means the structure of index's node is not identical with the headers structure in DOM.

For example:

```html
<h2>1</h2>
<h1>2</h1>
<h2>3</h2>
<h3>4</h3>
<h2>5</h2>
```

It will generate a structure like this:

- 1
- 2
 - 3
    - 4
 - 5


Although the level of first H2 is smaller then the H1 which next to it, but H2 occured first. H2 can't hold H1 as its children, so H1 become the sibling of H2, but check the last H2, it can't be held as a children by H3, so it find H1 as its parent, so the last H2 become the sibling of the middle H2.


Or, you may consider about the nesting structure like this:

```html
<h2>1</h2>
<div>
  <p>Content</p>
  <h1>2</h1>
</div>
<h2>3</h2>
<div>
  <h3>4</h3>
  <p>Content</p>
  <div>
    <h2>5</h2>
  </div>
</div>
```

This DOM structure is totally a mess, but my indexer still work, and the result is the same as the last example.
:smile:

##  TODO

- Expose style interface.
- Add transition animation for anchor.
- Maybe a jQuery plugin version?
