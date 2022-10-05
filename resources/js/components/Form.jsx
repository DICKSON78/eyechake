import React, { cloneElement } from "react";

class Form extends React.Component {

  constructor(props) {
    super(props);

    this.allFields = 0;
    this.validFields = 0;
  }

  _validateInputs(children) {
    if (!children) return true;

    if (typeof children.forEach !== "function") {
      children = [children];
    }

    children.filter(e => !!e).forEach(e => {
      const hasChildren = e.props && e.props.children;
      if (hasChildren) {
        this._validateInputs(e.props.children);
      } else {
        if (e.ref && e.props && (e.props.required || e.props.rules)) {
          const component = cloneElement(e).ref.current;
          if (component) {
            this.allFields++;
            if (component.validate()) {
              this.validFields++;
            }
          }
        }
      }
    });
  }

  _clearInputs(children) {
    if (!children) return true;

    if (typeof children.forEach !== "function") {
      children = [children];
    }

    children.filter(e => !!e).forEach(e => {
      const hasChildren = e.props && e.props.children;
      if (hasChildren) {
        this._clearInputs(e.props.children);
      } else {
        if (e.ref) {
          const component = cloneElement(e).ref.current;
          if (component && typeof component.setValue === "function") {
            component.setValue(null);
          }
        }
      }
    });
  }

  validate() {
    this.allFields = 0;
    this.validFields = 0;
    this._validateInputs(this.props.children);
    return this.allFields === this.validFields;
  }

  clear() {
    this._clearInputs(this.props.children);
  }

  render() {
    return (
      <form
        ref={(ref) => this.form = ref}
        autoComplete={"off"}
        {...this.props}
      >
        {this.props.children}
      </form>
    );
  }
}

export default Form;
