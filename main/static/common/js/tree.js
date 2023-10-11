/************************************************** tree **************************************************************/
/*
list child toggle style
header page style
horizontal list expanded style
*/
/************************************* list child toggle style **************************************/

.node > .dropdown-toggler{
    color:#333;
    font-size:15px;
    font-weight:bold;
    background-color:transparent;
    background-image: linear-gradient(to top, #5e402c 0, #f7f7f7 8%);
    position: relative;
    display: flex;
    padding-top: 10px;
    padding-bottom: 10px;
    width: 100%;
}
.node-list-container > .dropdown-section *{
   /*transition: line-height 1s ease-in-out;*/
}

.node-list-container > .dropdown-section[aria-expanded='false'],
.node-list-container > .dropdown-section[aria-expanded='false']  > ul
{
    max-height: 0;
    padding:0;
    margin:0;
    transition: max-height 0.15s ease-out;
    overflow: hidden;
}
.node-list-container > .dropdown-section[aria-expanded='true'],
.node-list-container > .dropdown-section[aria-expanded='true'] > ul{
    max-height: 500px; /* only number effects on transition */
    transition: max-height 0.15s ease-in;
}

.tree-list-container{
    position:relative;
}
.node > .dropdown-element{
    padding:5px;
}
.node > .dropdown-section{
    z-index: 1000;
    height:0;
    float: left;
    font-size: 14px;
    text-align: left;
    background-color: #fff;
    -webkit-background-clip: padding-box;
    background-clip: padding-box;
    border: 1px solid #ccc;
    border-radius: 4px;
    -webkit-box-shadow: 0 6px 12px rgb(0 0 0 / 18%);
    box-shadow: 0 6px 12px rgb(0 0 0 / 18%);
}
.node-list-container > .dropdown-section.open{
    height:fit-content;
    transition: height linear 0.3s;
}

