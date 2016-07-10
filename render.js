"use strict";

const apiUrl = "http://dss-todo.herokuapp.com/api";

const ToDo = React.createClass({
  getInitialState: function() {
    this.state = {};
    // convert string value from Firebase to boolean
    this.state.isDone = this.props.isDone === "true" ? true : false;
    return this.state;
  },
  render: function() {
    console.log("defaultChecked",this.state.isDone);
    return (
      <label className="todo">
        <input type="checkbox" defaultChecked={this.state.isDone} onClick={this.handleClick}/>
        {this.props.text}
        <br/>
      </label>
    );
  },
  handleClick: function(event) {
    // toggle checkbox
    this.state.isDone = !this.state.isDone;
    console.log("doing put to",apiUrl + "?key=" + this.props.fbKey + "isDone=" + this.state.isDone);
    $.ajax({
      url: apiUrl + "?key=" + this.props.fbKey + "&isDone=" + this.state.isDone,
      type: "PUT",
      success: function(data) {
        console.log("UPDATED");
      }
    });
  }
});

const ToDoList = React.createClass({
  getInitialState: function() {
    return {list: []}
  },
  componentDidMount: function()  {
    $("#addTask").on("click", this.addTask);
    this.loadToDoListFromServer();
  },
  loadToDoListFromServer: function() {
    $.get(apiUrl)
      .done((res) => {
        let foo = [];
        Object.keys(res.data).forEach((key) => {
          foo.push({id: key, data: res.data[key]})
        });
        this.setState({list: foo.reverse()});  // newest entries are first in list
      }.bind(this))
      .fail(() => {
        console.log("AJAX error");
      }.bind(this));
  },
  render: function() {
    // conditional render:
    // don't want to return HTML before AJAX is finished
    if (this.state.list.length > 0) {
      return (
        <div className="todoList">
          {this.generateDisplayList(this.state.list)}
        </div>
      );
    } else { return null }
  },
  generateDisplayList: function(arr) {
    let list = arr.map((o) => {
      return <ToDo key={o.id} fbKey={o.id} text={o.data.text} isDone={o.data.isDone}></ToDo>
    });
    return list;
  },
  addTask: function(e) {
    $.post(apiUrl, {text: $("#newTaskName").val(), isDone: false})
      .done((res) => {
        let newArray = this.state.list;
        newArray.unshift({
          "id": res.data.key,
          "data": { "isDone" : res.data.isDone,
                    "text" : res.data.text }
          });
        this.setState({list: newArray});  // setState triggers new render
      })
      .fail((err) => {
        console.log(err);
      });
  }
})

ReactDOM.render(
  React.createElement(ToDoList,null),
                      document.getElementById("content")
);
