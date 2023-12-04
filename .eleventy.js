module.exports = function (eleventyConfig) {
  eleventyConfig.addPassthroughCopy("line-drawing-component.js");
  eleventyConfig.addPassthroughCopy("demos.js");
  eleventyConfig.addPassthroughCopy("styles.css");
};
