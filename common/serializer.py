import decimal
import uuid
import datetime

from django.core import serializers
from django.core.serializers.json import DjangoJSONEncoder
from django.db import models
from django.utils.duration import duration_iso_string
from django.utils.functional import Promise
from django.utils.timezone import is_aware


class CustomDjangoJSONEncoder(DjangoJSONEncoder):
    # add fileField

    def default(self, o):
        # See "Date Time String Format" in the ECMA-262 specification.

        if isinstance(o, datetime.datetime):
            r = o.isoformat()
            if o.microsecond:
                r = r[:23] + r[26:]
            if r.endswith('+00:00'):
                r = r[:-6] + 'Z'
            return r
        elif isinstance(o, datetime.date):
            return o.isoformat()
        elif isinstance(o, datetime.time):
            if is_aware(o):
                raise ValueError("JSON can't represent timezone-aware times.")
            r = o.isoformat()
            if o.microsecond:
                r = r[:12]
            return r
        elif isinstance(o, datetime.timedelta):
            return duration_iso_string(o)
        elif isinstance(o, (decimal.Decimal, uuid.UUID, Promise)):
            return str(o)
        elif isinstance(o, models.fields.files.FieldFile):
            print(o)
            return o.name
        else:
            return super().default(o)
