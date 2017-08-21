"use strict";
// ==UserScript==
// @name           WhatsApp Web Accessibility Fixes
// @namespace      http://userscripts.bramd.nl/
// @description    Improves the accessibility of WhatsApp Web.
// @author         Bram Duvigneau <bram@bramd.nl>
// @copyright 2016-2017 Bram Duvigneau
// @license GNU General Public License version 3.0
// @version        0.2
// @grant GM_log
// @include https://web.whatsapp.com/*
// ==/UserScript==

function randomId() {
	return '_' + Math.random().toString(36).substr(2, 9);
}

function handleApp(app) {
	var chats = app.querySelector("div.chatlist");
	chats.setAttribute("role", "list");
	chats.setAttribute("aria-label", "Chats");
	chats.setAttribute("id", "chatlist");
}

function onNodeAdded(node) {
	var classList = node.classList;
	
	if (classList) {
		GM_log(classList);
		if (classList.contains("app")) {
			handleApp(node);
		}
		if (classList.contains("infinite-list-item")) {
			node.setAttribute("role", "listitem");
			node.setAttribute("id", randomId());
			var focusDiv = node.querySelector("div[tabindex]");
			if (focusDiv) {
				focusDiv.setAttribute("aria-labelledby", node.getAttribute("id"));
				// focusDiv.setAttribute("role", "listitem");
			}
		}
		if (classList.contains("chat-status")) {
			node.setAttribute("aria-live", "polite");
		}
		if (classList.contains("pane-two")) {
			node.setAttribute("role", "main");
		}
		if (classList.contains("pane-chat")) {
			var messageList = node.querySelector(".message-list");
			messageList.setAttribute("role", "log");
			var chatTitle = node.querySelector(".chat-title");
			chatTitle.setAttribute("role", "heading");
			chatTitle.setAttribute("aria-level", 1);
		}
	}
}

function onClassModified(target) {
}

var observer = new MutationObserver(function(mutations) {
	for (var mutation of mutations) {
		try {
			if (mutation.type === "childList") {
				for (var node of mutation.addedNodes) {
					if (node.nodeType != Node.ELEMENT_NODE)
						continue;
					onNodeAdded(node);
				}
			} else if (mutation.type === "attributes") {
				if (mutation.attributeName == "class")
					onClassModified(mutation.target);
			}
		} catch (e) {
			// Catch exceptions for individual mutations so other mutations are still handled.
			GM_log("Exception while handling mutation: " + e);
		}
	}
});

observer.observe(document, {childList: true, attributes: true,
	subtree: true, attributeFilter: ["class"]});
