# osio-ngx-framework

Welcome to osio-ngx-framework.  This is a library of common Angular components for use with the OSIO implementation. Below is information on how to get started using osio-ngx-framework.  If you wish to contribute to osio-ngx-framework, please go to our [Contributions page][contributing].

### Running Tests

You will need ´´´karma cli´´´ installed globally, then run

```
npm run test
```

### Using osio-ngx-framework In Your Application

This example demonstrates using the Angular-cli to get started with osio-ngx-framework

1. Installing angular-cli  
*Note*: you can skip this part if you already have generated an Angular application using `ng-cli` and webpack
  
 ```bash
 npm i -g @angular/cli
 ng new osio-ngx-framework-app
 cd osio-ngx-framework-app
 ng serve
 ```

2. Install osio-ngx-framework
   ```bash
     npm install osio-ngx-framework --save
   ```

3. Add osio-ngx-framework dependencies
 
 - install `patternfly` and `ngx-bootstrap`

 ```bash
   npm install patternfly ngx-bootstrap --save
 ```
 
4. Add a osio-ngx-framework component
- open `src/app/app.module.ts` and add

```typescript
import { NotificationModule } from 'osio-ngx-framework';
...

@NgModule({
   ...
   imports: [NotificationModule, ... ],
    ... 
})
```

- open `.angular-cli.json` and insert a new entry into the styles array 

```json
      "styles": [
         "../node_modules/patternfly/dist/css/patternfly.min.css",
         "../node_modules/patternfly/dist/css/patternfly-additions.min.css",
        "styles.css",
      ],
```

- open `src/app/app.component.html` and add
```
<pfng-toast-notification
  [header]="'test header'"
  [message]="'this is a notification'"
  [showClose]="'true'"
  [type]="'success'">
</pfng-toast-notification>
```

## <a name="question"></a> Do you have a question?
 - Search our [GitHub issues][github-issues]

[contributing]: https://github.com/michaelkleinhenz/osio-ngx-framework/blob/master/CONTRIBUTING.md
[github-issues]: https://github.com/michaelkleinhenz/osio-ngx-framework/issues
