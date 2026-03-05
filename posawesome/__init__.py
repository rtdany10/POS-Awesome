# -*- coding: utf-8 -*-
from __future__ import unicode_literals

__version__ = "6.1.3"


def console(*data):
    import frappe
    frappe.publish_realtime("toconsole", data, user=frappe.session.user)
