import{j as _}from"./index-z3nM8h1Y.js";import{r as c}from"./antd-e7sbBBYo.js";function l(t){"@babel/helpers - typeof";return l=typeof Symbol=="function"&&typeof Symbol.iterator=="symbol"?function(e){return typeof e}:function(e){return e&&typeof Symbol=="function"&&e.constructor===Symbol&&e!==Symbol.prototype?"symbol":typeof e},l(t)}function w(t,e){if(l(t)!="object"||!t)return t;var n=t[Symbol.toPrimitive];if(n!==void 0){var r=n.call(t,e);if(l(r)!="object")return r;throw new TypeError("@@toPrimitive must return a primitive value.")}return(e==="string"?String:Number)(t)}function z(t){var e=w(t,"string");return l(e)=="symbol"?e:e+""}function N(t,e,n){return(e=z(e))in t?Object.defineProperty(t,e,{value:n,enumerable:!0,configurable:!0,writable:!0}):t[e]=n,t}function C(t,e){if(t==null)return{};var n={};for(var r in t)if({}.hasOwnProperty.call(t,r)){if(e.indexOf(r)>=0)continue;n[r]=t[r]}return n}function I(t,e){if(t==null)return{};var n,r,o=C(t,e);if(Object.getOwnPropertySymbols){var i=Object.getOwnPropertySymbols(t);for(r=0;r<i.length;r++)n=i[r],e.indexOf(n)>=0||{}.propertyIsEnumerable.call(t,n)&&(o[n]=t[n])}return o}var S={exports:{}};/*!
  Copyright (c) 2017 Jed Watson.
  Licensed under the MIT License (MIT), see
  http://jedwatson.github.io/classnames
*/(function(t){(function(){var e={}.hasOwnProperty;function n(){for(var r=[],o=0;o<arguments.length;o++){var i=arguments[o];if(i){var s=typeof i;if(s==="string"||s==="number")r.push(i);else if(Array.isArray(i)&&i.length){var u=n.apply(null,i);u&&r.push(u)}else if(s==="object")for(var a in i)e.call(i,a)&&i[a]&&r.push(a)}}return r.join(" ")}t.exports?(n.default=n,t.exports=n):window.classNames=n})()})(S);var A=S.exports,D="t",L="zh-CN",T=c.createContext({classPrefix:D,locale:L}),g=(function(){return c.useContext(T)});function M(){var t=g(),e=t.classPrefix;return c.useMemo(function(){return{SIZE:{default:"",xs:"".concat(e,"-size-xs"),small:"".concat(e,"-size-s"),medium:"".concat(e,"-size-m"),large:"".concat(e,"-size-l"),xl:"".concat(e,"-size-xl"),block:"".concat(e,"-size-full-width")},STATUS:{loading:"".concat(e,"-is-loading"),disabled:"".concat(e,"-is-disabled"),focused:"".concat(e,"-is-focused"),success:"".concat(e,"-is-success"),error:"".concat(e,"-is-error"),warning:"".concat(e,"-is-warning"),selected:"".concat(e,"-is-selected"),active:"".concat(e,"-is-active"),checked:"".concat(e,"-is-checked"),current:"".concat(e,"-is-current"),hidden:"".concat(e,"-is-hidden"),visible:"".concat(e,"-is-visible"),expanded:"".concat(e,"-is-expanded"),indeterminate:"".concat(e,"-is-indeterminate")}}},[e])}function k(t){var e=M().SIZE;return typeof t>"u"?{}:t in e?{className:e[t],style:{}}:{className:"",style:{fontSize:t}}}function v(t,e){if(!(!document||!t||typeof t!="string")&&!(document.querySelectorAll(".".concat(e,'[src="').concat(t,'"]')).length>0)){var n=document.createElement("script");n.setAttribute("class",e),n.setAttribute("src",t),document.body.appendChild(n)}}function R(){var t="__TDESIGN_ICON_STYLE__",e=`@keyframes t-spin {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }
  .t-icon {
    display: inline-block;
    vertical-align: middle;
    width: 1em;
    height: 1em;
  }
  .t-icon::before {
    font-family: unset;
  }
  .t-icon-loading {
    animation: t-spin 1s linear infinite;
  }
  .t-icon.t-size-s,
  i.t-size-s {
    font-size: 14px;
  }
  .t-icon.t-size-m,
  i.t-size-m {
    font-size: 16px;
  }
  .t-icon.t-size-l,
  i.t-size-l {
    font-size: 18px;
  }
  `;if(!(!document||document.getElementById(t))){var n=document.createElement("style");n.setAttribute("id",t),n.innerHTML=e,document.head.appendChild(n)}}var U=["name","size","url","loadDefaultIcons","className","style"];function b(t,e){var n=Object.keys(t);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(t);e&&(r=r.filter(function(o){return Object.getOwnPropertyDescriptor(t,o).enumerable})),n.push.apply(n,r)}return n}function m(t){for(var e=1;e<arguments.length;e++){var n=arguments[e]!=null?arguments[e]:{};e%2?b(Object(n),!0).forEach(function(r){N(t,r,n[r])}):Object.getOwnPropertyDescriptors?Object.defineProperties(t,Object.getOwnPropertyDescriptors(n)):b(Object(n)).forEach(function(r){Object.defineProperty(t,r,Object.getOwnPropertyDescriptor(n,r))})}return t}var q="https://tdesign.gtimg.com/icon/0.4.2/fonts/index.js",h=c.forwardRef(function(t,e){var n=g(),r=n.classPrefix,o=t.name,i=t.size,s=t.url,u=t.loadDefaultIcons,a=u===void 0?!0:u,d=t.className,x=t.style,O=I(t,U),y=k(i),p=y.className,P=y.style,j=c.useMemo(function(){var f=s?o:"".concat(r,"-icon-").concat(o);return A("".concat(r,"-icon"),f,p,d)},[r,d,o,p]);return c.useEffect(function(){R()},[]),c.useEffect(function(){a&&v(q,"".concat(r,"-svg-js-stylesheet--unique-class"))},[r,a]),c.useEffect(function(){var f=Array.isArray(s)?s:[s];f.forEach(function(E){v(E,"".concat(r,"-svg-js-stylesheet--unique-class"))})},[r,s]),c.createElement("svg",m({ref:e,className:j,style:m(m({},x),P)},O),c.createElement("use",{xlinkHref:s?"#".concat(o):"#t-icon-".concat(o)}))});h.displayName="Icon";function G({name:t,size:e="medium",style:n,className:r}){return _.jsx(h,{name:t,size:e,style:n,className:r})}export{G as T};
