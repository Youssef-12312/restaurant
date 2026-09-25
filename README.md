# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

## تقرير مشكلة إرسال الطلبات

### وصف المشكلة

عند الضغط على تأكيد الطلب من صفحة Checkout تظهر الرسالة: "حدث خطأ أثناء إرسال الطلب، برجاء المحاولة مرة أخرى."

### السبب الحقيقي

الواجهة تستدعي Cloud Function باسم `createOrder` في منطقة `us-central1`، لكن الدالة غير منشورة حاليًا في مشروع Firebase `resturant-test-2553a`.

تم التحقق من ذلك بالأدلة التالية:

- طلب `OPTIONS` إلى رابط الدالة يرجع `HTTP/1.1 404 Not Found`.
- الأمر `firebase functions:list --project resturant-test-2553a` يرجع `No functions found`.
- خطأ CORS الظاهر في المتصفح هو نتيجة ثانوية لأن endpoint غير موجود، وليس المشكلة الأساسية في إعداد CORS.

### ما تم فحصه

- صفحة Checkout في `src/pages/CheckOut.jsx`.
- خدمة إرسال الطلب في `src/services/orderService.js`.
- كود الدالة في `functions/index.js`.
- إعدادات Firebase في `src/services/firebase.js`.
- حالة الدوال المنشورة واستجابة CORS الفعلية.
- Build الواجهة وفحص syntax الخاص بالدالة.

نجح بناء الواجهة، كما أن كود الدالة لا يحتوي على خطأ syntax.

### محاولة النشر

تمت محاولة نشر الدالة بالأمر التالي:

```bash
firebase deploy --only functions:createOrder --project resturant-test-2553a
```

لكن النشر فشل لأن المشروع يحتاج إلى خطة Blaze:

```text
Your project resturant-test-2553a must be on the Blaze (pay-as-you-go) plan
```

### ما تم تغييره

لم يتم تعديل كود التطبيق؛ لأن السبب هو عدم وجود الدالة المنشورة على Firebase، وليس خطأ داخل React أو إعداد CORS.

### الحل النهائي

1. ترقية مشروع Firebase `resturant-test-2553a` إلى خطة **Blaze** من Firebase Console.
2. تشغيل أمر النشر من جذر المشروع:

```bash
firebase deploy --only functions:createOrder --project resturant-test-2553a
```

3. التأكد من ظهور الدالة:

```bash
firebase functions:list --project resturant-test-2553a
```

يجب أن تظهر الدالة `createOrder` في منطقة `us-central1`. بعدها يتم إعادة تحميل الموقع وتجربة إرسال الطلب مرة أخرى.

### ملاحظة

إضافة إعداد CORS وحدها لن تحل المشكلة طالما أن endpoint غير موجود. من المحتمل أن الدالة كانت منشورة سابقًا ثم تم حذفها أو لم تعد موجودة في مشروع Firebase الحالي.
