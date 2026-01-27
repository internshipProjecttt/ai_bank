using Bank_App.Data;
using Bank_App.Repositories;
using Bank_App.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.AddDbContext<BankContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

builder.Services.AddScoped<IUserRepository, UserRepository>();
builder.Services.AddScoped<IUserAccountRepository, UserAccountRepository>(); 
builder.Services.AddScoped<ITransactionRepository, TransactionRepository>();

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins("http://localhost:3000")  // Frontend port
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

var app = builder.Build();

app.UseSwagger();
app.UseSwaggerUI(c =>
{
    c.SwaggerEndpoint("/swagger/v1/swagger.json", "Bank API V1");
    c.RoutePrefix = string.Empty; // Böylece http://localhost:5000/ direkt swagger açılır
});

app.UseCors("AllowFrontend");

app.MapControllers();

app.Run();
