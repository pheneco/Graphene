#CSS

##Purpose

This document is written to create a standard coduing styleguide for CSS or CSS preprocessors within all Phene.co projects. Modifications can be made per project, and should be noted within the appropriate documentation.

##Tools and Rationales

###Preprocessors

To allow for more efficient production, it is recommended that a CSS preprocessor be used. This permits the usage of variables for colors or repetitive styling techniques as well as to write more concise CSS overall without losing any stylign in the end product. The prepocessor of choice for most Phene.co projects is [Sass](http://sass-lang.com/), particularly using the `scss` style. The use of [node-sass](https://www.npmjs.com/package/node-sass) rather than [Ruby Sass](http://sass-lang.com/install) is highly recommended as it removes the Ruby dependency from a project (it is also supposedly a more efficient implementation using a C library rather than a Ruby one).

###Linting

**WIP** Linting allows you to check and fix your code so as to ensure your code follows this styleguide. A `.scss-lint.yml` file will be supplied to aid in this process. While there are several tools to do this, [stylelint](http://stylelint.io/) appears to be the best for the purposes of this guide, as it also avoids a Ruby dependency.

###Autoprefixing

Continuing on the theme of concise and consistent coding, [Autoprefixer](https://github.com/postcss/autoprefixer) is another recommended tool for development. This will remove the necessity of repeating sections of code for multiple vendors by checking with [Can I Use](http://caniuse.com/) to determine if a style requires vendor prefixes and subsequently applies said prefixes to the styles.

##Styling

###Spacing

- Limit the CSS files' width to 200 characters.

- Use four character tabs.

- Do not put spaces after `:` in property declarations.

- Tabulate the `{` in rule declarations to column 29 or 7 tabs from the baseline.

- Keep all declarations in a single line. Add a new line when the declarations in a rule reach 200 characters, tabbing out the next line to column 29. This may cause difficulty in line-by-line error reporting; however, all CSS debuging should be done in browser.

- Multiple selectors should each be on a single line, with no space after the comma.

```css
// Bad
.rule {
  margin: 1em;
}

// Bad
.rule{margin:1em;text-align:right;}

// Good
.rule                       {margin:1em;text-align:right;}
```