#CSS Guide

##Purpose

This document is written to create a standard coduing styleguide for CSS or CSS preprocessors within all Phene.co projects. Modifications can be made per project, and should be noted within the appropriate documentation.

##Tools and Rationales

###Preprocessors

To allow for more efficient production, it is recommended that a CSS preprocessor be used. This permits the usage of variables for colors or repetitive styling techniques as well as to write more concise CSS overall without losing any stylign in the end product. The prepocessor of choice for most Phene.co projects is [Sass](http://sass-lang.com/), particularly using the `scss` style. The use of [node-sass](https://www.npmjs.com/package/node-sass) rather than [Ruby Sass](http://sass-lang.com/install) is highly recommended as it removes the Ruby dependency from a project (it is also supposedly a more efficient implementation using a C library rather than a Ruby one).

###Linting

`WIP` Linting allows you to check and fix your code so as to ensure your code follows this styleguide. A `.scss-lint.yml` file will be supplied to aid in this process. While there are several tools to do this, [stylelint](http://stylelint.io/) appears to be the best for the purposes of this guide, as it also avoids a Ruby dependency.

###Autoprefixing

Continuing on the theme of concise and consistent coding, [Autoprefixer](https://github.com/postcss/autoprefixer) is another recommended tool for development. This will remove the necessity of repeating sections of code for multiple vendors by checking with [Can I Use](http://caniuse.com/) to determine if a style requires vendor prefixes and subsequently applies said prefixes to the styles.

##Styling

This section is based in part on [18F's Front End Guide](https://pages.18f.gov/frontend/), with modifications to the actual styling described.

###Spacing

- Limit the CSS files' width to 200 characters.

- Use four character tabs.

- Do not put spaces after `:` in property declarations.

- Tabulate the `{` in rule declarations to column 29 or 7 tabs from the baseline.

- Keep all declarations in a single line. Add a new line when the declarations in a rule reach 200 characters, tabbing out the next line to column 29. This may cause difficulty in line-by-line error reporting; however, all CSS debuging should be done in browser.

- Multiple selectors should each be on a single line, with no space after the comma.

```scss
selector {
  margin: 1em;
}

// Bad
selector{margin:1em;text-align:right;}

// Good
selector                    {name:value;name:value;}
selector                    {name:value;}
```

###Property-Value Pairs

- Put each pair on the same line, only adding new lines when the 200 character mark has been reached.

- Indent new lines to column 29.

- End each pair in a semicolon.

- Separate values and operators with spaces.

```scss
// Bad
selector                    {margin:($variable+1em);}

// Good
selector                    {margin:($variable + 1em);}
```

- Wrap calculations in parentheses.

```scss
// Bad
selector                    {margin:$variable + 1em;}

// Good
selector                    {margin:($variable + 1em);}
```

- Do not use shorthand declarations unless explicitly setting all values.

```scss
// Bad
selector                    {margin:inherit 1em;}

// Good
selector                    {margin-bottom:1em;}
selector                    {margin:1em 2em 3em 4em;}
```

- Use single-quotes for URLs and string values.

```scss
selector                    {background-image:('/assets/background.jpg');font-family:'Roboto',sans-serif;}
```

- Avoid arbitrary values that are repeated, linked, or dependent on other parts of the code.

```scss
// Bad
selector                    {top:0.112em;}

// Good
$variable:100%;
selector					{top:$variable;}
```

###Ordering
