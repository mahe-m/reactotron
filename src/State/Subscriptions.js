import { inject, observer } from "mobx-react"
import { is, map, merge } from "ramda"
import React, { Component } from "react"
import Keystroke from "../Lib/Keystroke"
import Empty from "../Shared/EmptyState"
import Key from "../Shared/Key"
import { colorForValue, textForValue } from "../Shared/MakeTable"
import ObjectTree from "../Shared/ObjectTree"
import AppStyles from "../Theme/AppStyles"
import Colors from "../Theme/Colors"
import { MdDelete as IconDelete, MdNotificationsNone } from "react-icons/md"

const Styles = {
  container: {
    ...AppStyles.Layout.vbox,
    margin: 0,
    flex: 1,
  },
  iconSize: 24,
  watches: {
    margin: 0,
    padding: 0,
    overflowY: "auto",
    overflowX: "hidden",
  },
  watch: {
    ...AppStyles.Layout.hbox,
    padding: "15px 20px",
    justifyContent: "space-between",
    borderBottom: `1px solid ${Colors.line}`,
  },
  watchLeft: {
    flex: 0.3,
    wordBreak: "break-all",
  },
  watchPath: {
    cursor: "text",
    WebkitUserSelect: "text",
    color: Colors.tag,
  },
  watchValue: {
    flex: 0.7,
    wordBreak: "break-all",
    WebkitUserSelect: "text",
  },
  button: {
    cursor: "pointer",
    paddingLeft: 10,
  },
  message: {
    lineHeight: 1.8,
  },
}

@inject("session")
@observer
class WatchPanel extends Component {
  constructor(props) {
    super(props)
    this.renderWatch = this.renderWatch.bind(this)
  }

  renderWatch(watch, indent = 0) {
    const unsubscribe = path => {
      this.props.session.ui.removeStateWatch(path)
    }
    const key = `watch-${watch.path}`
    const value = is(Object, watch.value) ? (
      <ObjectTree object={{ value: watch.value }} />
    ) : (
      textForValue(watch.value)
    )
    const watchValueStyles = merge(Styles.watchValue, { color: colorForValue(watch.value) })
    return (
      <div style={Styles.watch} key={key}>
        <div style={Styles.watchLeft}>
          <div style={Styles.watchPath}>{watch.path}</div>
        </div>
        <div style={watchValueStyles}>{value}</div>
        <IconDelete
          size={Styles.iconSize}
          style={Styles.button}
          onClick={unsubscribe.bind(this, watch.path)}
        />
      </div>
    )
  }

  renderTooManyConnection() {
    return (
      <Empty icon={MdNotificationsNone} title="Too many connections">
        <p style={Styles.message}>
          When you have more then 1 connection you must select which connection to see the values
          of.
        </p>
      </Empty>
    )
  }

  renderEmpty() {
    return (
      <Empty icon={MdNotificationsNone} title="No Subscriptions">
        <p style={Styles.message}>
          You can subscribe to state changes in your redux or mobx-state-tree store by pressing{" "}
          <Key text={Keystroke.modifierName} /> + <Key text="N" />.
        </p>
      </Empty>
    )
  }

  render() {
    const { watches, connections, selectedConnection } = this.props.session
    const isEmpty = watches.length === 0
    const isManyConnections = connections.length > 1 && selectedConnection === null

    return (
      <div style={Styles.container}>
        {isEmpty && !isManyConnections && this.renderEmpty()}
        {!isEmpty &&
          !isManyConnections && <div style={Styles.watches}>{map(this.renderWatch, watches)}</div>}
        {isManyConnections && this.renderTooManyConnection()}
      </div>
    )
  }
}

export default WatchPanel
